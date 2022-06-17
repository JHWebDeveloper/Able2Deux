import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, powerSaveBlocker } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { pathToFileURL } from 'url'
import path from 'path'

import { initPreferences, loadPrefs, savePrefs, getDefaultPrefs } from './modules/preferences/preferences'
import { initScratchDisk, scratchDisk, updateScratchDisk } from './modules/scratchDisk'
import { getURLInfo, downloadVideo, cancelDownload, stopLiveDownload } from './modules/acquisition/download'
import { upload } from './modules/acquisition/upload'
import { getRecordSources, saveScreenRecording } from './modules/acquisition/screenRecorder'
import { checkFileType, getMediaInfo } from './modules/acquisition/mediaInfo'
import { createPreviewStill, changePreviewSource, copyPreviewToImports } from './modules/formatting/preview'
import { render, cancelRender } from './modules/formatting/formatting'
import { fileExistsPromise } from './modules/utilities'

const mac = process.platform === 'darwin'
const dev = process.env.NODE_ENV === 'development'
const devtools = dev || process.env.DEVTOOLS
let splashWin = false
let updateWin = false
let mainWin = false
let preferences = false
let help = false

process.noDeprecation = !dev

autoUpdater.autoDownload = false
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

if (!dev) {
	log.catchErrors({ showDialog: false })
	console.error = log.error
}

const openWindow = (opts = {}) => new BrowserWindow({
	show: false,
	backgroundColor: '#eee',
	webPreferences: {
		nodeIntegration: dev,
		contextIsolation: !dev,
		enableEval: false,
		enableRemoteModule: false,
		preload: dev
			? path.join(__dirname, 'preload', 'babelRegister.js')
			: path.join(__dirname, 'preload.js')
	},
	...opts
})

const createURL = (view = 'index') => {
	const { href } = dev
		? new URL(`http://localhost:${process.env.PORT}/${view}.html`)
		: pathToFileURL(path.join(__dirname, 'renderer', `${view}.html`))

	return href
}

const checkForUpdate = () => {
	if (!app.isPackaged || mac) return Promise.resolve(false)

	return new Promise(resolve => {
		autoUpdater.on('update-available', ({ version }) => resolve(version))
		autoUpdater.on('update-not-available', () => resolve(false))
		autoUpdater.on('error', err => {
			console.error(err)
			resolve(false)
		})
		autoUpdater.checkForUpdatesAndNotify()
	})
}

const splashWindowOpts = {
	width: 400,
	height: 400,
	resizable: dev,
	frame: false,
	maximizable: false
}

const createSplashWindow = () => {
	splashWin = openWindow(splashWindowOpts)

	if (mac) Menu.setApplicationMenu(Menu.buildFromTemplate(splashWindowMenuTemplate))

	splashWin.on('ready-to-show', () => {
		splashWin.show()
	})

	splashWin.on('close', () => splashWin = false)
	splashWin.loadURL(createURL('splash'))
}

const createUpdateWindow = version => {
	updateWin = openWindow(splashWindowOpts)

	updateWin.on('ready-to-show', () => {
		updateWin.show()
		if (splashWin) splashWin.close()
		autoUpdater.downloadUpdate()
		updateWin.webContents.send('updateStarted', version)
	})

	updateWin.on('close', () => updateWin = false)

	autoUpdater.on('download-progress', ({ percent }) => {
		updateWin.webContents.send('updateProgress', percent)
	})
	
	autoUpdater.on('update-downloaded', () => {
		autoUpdater.quitAndInstall()
	})

	autoUpdater.on('error', err => {
		console.error(err)
		updateWin.webContents.send('updateError')
	})

	updateWin.loadURL(createURL('update'))
}

const createMainWindow = () => {
	mainWin = openWindow({
		width: mac ? 746 : 762,
		height: 800,
		minWidth: mac ? 746 : 762,
		minHeight: 620
	})

	mainWin.loadURL(createURL())

	Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate))

	mainWin.on('ready-to-show', () => {
		mainWin.show()
		if (splashWin) splashWin.close()
		if (dev) mainWin.webContents.openDevTools()
	})

	mainWin.on('close', () => mainWin = false)
}

const startApp = async () => {
	createSplashWindow()

	try {
		await initPreferences()
		await initScratchDisk()
	} catch (err) {
		console.error(err)
	}

	const version = await checkForUpdate()

	if (version) {
		createUpdateWindow(version)
	} else {
		createMainWindow()
	}
}

const lock = app.requestSingleInstanceLock()

if (!lock) {
	app.quit()
} else {
	app.on('second-instance', () => {
		if (mainWin) {
			if (mainWin.isMinimized()) mainWin.restore()
			mainWin.focus()
		}
	})

	app.on('ready', startApp)
}

app.on('window-all-closed', () => {
	if (!mac) app.quit()
})

app.on('activate', () => {
	if (!mainWin && !splashWin && !updateWin) createMainWindow()
})


// ---- MENU CONFIG --------

const appleSubmenu = (prefs = []) => [
	{
		label: 'About',
		role: 'about'
	},
	...prefs,
	{ type: 'separator' },
	{
		label: 'Hide',
		role: 'hide'
	},
	{ role: 'hideothers' },
	{ type: 'separator' },
	{ 
		label: 'Quit',
		role: 'quit'
	}
]

const splashWindowMenuTemplate = [{
	label: app.name,
	submenu: appleSubmenu()
}]

const enablePrefsMenu = enabled => {
	Menu.getApplicationMenu().getMenuItemById('Preferences').enabled = enabled
}

const prefsMenuItem = [
	{ type: 'separator' },
	{
		label: 'Preferences',
		id: 'Preferences',
		accelerator: 'CmdOrCtrl+,',
		click() {
			enablePrefsMenu(false)

			const [ width, height ] = mainWin.getSize()

			preferences = openWindow({
				parent: mainWin,
				width,
				height,
				resizable: false,
				modal: true
			})

			preferences.loadURL(createURL('preferences'))

			preferences.once('ready-to-show', () => {
				preferences.show()
			})

			preferences.on('close', () => {
				enablePrefsMenu(true)
				preferences = false
			})

			preferences.setMenu(null)
		}
	}
]

const mainMenuTemplate = [
	...mac ? [{
		label: app.name,
		submenu: appleSubmenu(prefsMenuItem)
	}] : [],
	{
		label: 'File',
		submenu: [
			{
				label: 'Open Import Cache',
				click() {
					mainWin.webContents.send('openImportCache')
				}
			},
			{ type: 'separator' },
			mac ? { role: 'close' } : { role: 'quit' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ type: 'separator' },
			{ role: 'selectall' },
			...mac ? [] : prefsMenuItem
		]
	},
	{
		label: 'Help',
		submenu: [
			{
				label: 'Able2 Help',
				click() {
					const { x, y, width, height } = mainWin.getNormalBounds()

					help = openWindow({
						parent: mainWin,
						x: x + 20,
						y: y + 20,
						width,
						height,
						minWidth: mac ? 746 : 762,
						minHeight: 620
					})

					help.loadURL(createURL('help'))

					help.once('ready-to-show', () => {
						help.show()
					})

					help.on('close', () => {
						help = false
					})

					help.setMenu(null)
				}
			}
		]
	}
]

if (devtools) {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toggle DevTools',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools()
				}
			},
			{ role: 'reload' }
		]
	})
}

// ---- MODULE IPC ROUTES ----

const getURLInfoIPC = async (evt, data) => {
	const { id } = data

	try {
		evt.reply(`URLInfoRecieved_${id}`, await getURLInfo(data))
	} catch (err) {
		evt.reply(`URLInfoErr_${id}`, err)
	}
}

const requestDownloadIPC = async (evt, data) => {
	const { id } = data

	try {
		const tempFilePath = await downloadVideo(data, mainWin)
		const mediaData = await getMediaInfo(id, tempFilePath)

		evt.reply(`downloadComplete_${id}`, mediaData)
	} catch (err) {
		evt.reply(`downloadErr_${id}`, err)
	}
}

const cancelDownloadIPC = (evt, id) => cancelDownload(id)

const stopLiveDownloadIPC = (evt, id) => stopLiveDownload(id)

const checkFileTypeIPC = async (evt, data) => {
	try {
		evt.reply(`fileTypeFound_${data.id}`, await checkFileType(data.file))
	} catch (err) {
		evt.reply(`fileTypeErr_${data.id}`, err)
	}
}

const requestUploadIPC = async (evt, data) => {
	const { id, mediaType } = data

	try {
		const tempFilePath = await upload(data)
		const mediaData = await getMediaInfo(id, tempFilePath, mediaType)

		evt.reply(`uploadComplete_${id}`, mediaData)
	} catch (err) {
		evt.reply(`uploadErr_${id}`, err)
	}
}

const requestRecordSourcesIPC = async evt => {
	try {
		evt.reply('recordSourcesFound', await getRecordSources())
	} catch (err) {
		console.error(err)
		evt.reply('requestRecordSourcesErr', new Error('An error occurred while attempting to load recordable sources.'))
	}
}

const saveScreenRecordingIPC = async (evt, data) => {
	const { id, screenshot, fps } = data

	try {
		const tempFilePath = await saveScreenRecording(data)
		const mediaData = await getMediaInfo(id, tempFilePath, screenshot ? 'image' : 'video', fps)
		
		evt.reply(`screenRecordingSaved_${id}`, mediaData)
	} catch (err) {
		console.error(err)
		evt.reply(`saveScreenRecordingErr_${id}`, new Error(`An error occurred while attempting to save screen${screenshot ? 'shot' : ' recording'}.`))
	}
}

const removeMediaFileIPC = async (evt, id) => {
	try {
		await scratchDisk.imports.clear(id)
	} catch (err) {
		console.error(err)
	}
}

const initPreviewIPC = async (evt, data) => {
	try {
		changePreviewSource(data, mainWin)
	} catch (err) {
		console.error(err)
	}
}

const requestPreviewStillIPC = async (evt, data) => {
	try {
		evt.reply('previewStillCreated', await createPreviewStill(data))
	} catch (err) {
		if (!/^Error: ffmpeg (was killed with signal SIGKILL)|(exited with code 1)/.test(err.toString())) {
			console.error(err)
		}
	}
}

const copyPreviewToImportsIPC = async (evt, data) => {
	try {
		evt.reply('previewCopied', await copyPreviewToImports(data))
	} catch (err) {
		console.error(err)
		evt.reply('previewCopiedFailed', new Error('An error occurred while attempting to load screengrab.'))
	}
}

const checkDirectoryExistsIPC = async (evt, dir) => {
	try {
		return fileExistsPromise(dir)
	} catch (err) {
		console.error(err)
		return false
	}
}

const requestRenderIPC = async (evt, data) => {
	try {
		await render(data, mainWin)

		evt.reply(`renderComplete_${data.id}`)
	} catch (err) {
		evt.reply(`renderFailed_${data.id}`, err)
	}
}

const cancelRenderIPC = (evt, id) => cancelRender(id)

const clearTempFilesIPC = async () => {
	try {
		return scratchDisk.clearAll()
	} catch (err) {
		console.error(err)
	}
}

const requestPrefsIPC = async evt => {
	try {
		evt.reply('prefsRecieved', await loadPrefs())
	} catch (err) {
		console.error(err)
		evt.reply('prefsErr', new Error('An error occurred while attempting to load preferences.'))
	}
}

const savePrefsIPC = async (evt, prefs) => {
	try {
		await savePrefs(prefs)

		try {
			await updateScratchDisk()
		} catch (err) {
			console.error(err)
		}

		evt.reply('prefsSaved')
		mainWin.webContents.send('syncPrefs', prefs)
	} catch (err) {
		console.error(err)
		evt.reply('savePrefsErr', new Error('An error occurred while attempting to save preferences.'))
	}
}

const retryUpdate = async () => {
	autoUpdater.autoDownload = true
	autoUpdater.checkForUpdatesAndNotify()
}

const checkForUpdateBackup = async () => {
	try {
		const version = await checkForUpdate()
	
		if (version) {
			createUpdateWindow()
			mainWin.close()
		}
	} catch (err) {
		console.error(err)
	}
}

ipcMain.on('getURLInfo', getURLInfoIPC)
ipcMain.on('requestDownload', requestDownloadIPC)
ipcMain.on('cancelDownload', cancelDownloadIPC)
ipcMain.on('stopLiveDownload', stopLiveDownloadIPC)
ipcMain.on('checkFileType', checkFileTypeIPC)
ipcMain.on('requestUpload', requestUploadIPC)
ipcMain.on('requestRecordSources', requestRecordSourcesIPC)
ipcMain.on('saveScreenRecording', saveScreenRecordingIPC)
ipcMain.on('removeMediaFile', removeMediaFileIPC)
ipcMain.on('initPreview', initPreviewIPC)
ipcMain.on('requestPreviewStill', requestPreviewStillIPC)
ipcMain.on('copyPreviewToImports', copyPreviewToImportsIPC)
ipcMain.handle('checkDirectoryExists', checkDirectoryExistsIPC)
ipcMain.on('requestRender', requestRenderIPC)
ipcMain.on('cancelRender', cancelRenderIPC)
ipcMain.on('clearTempFiles', clearTempFilesIPC)
ipcMain.on('requestPrefs', requestPrefsIPC)
ipcMain.handle('requestDefaultPrefs', getDefaultPrefs)
ipcMain.on('savePrefs', savePrefsIPC)
ipcMain.on('retryUpdate', retryUpdate)
ipcMain.on('checkForUpdateBackup', checkForUpdateBackup)


// ---- ELECTRON IPC ROUTES ----

ipcMain.handle('getVersion', () => app.getVersion())

ipcMain.on('bringToFront', () => {
	mainWin.show()
})

ipcMain.on('hide', () => {
	mainWin.hide()
})

ipcMain.on('closePrefs', () => {
	preferences.close()
})

ipcMain.on('quit', () => {
	app.exit(0)
})

ipcMain.handle('showOpenDialog', (evt, opts) => dialog.showOpenDialog(opts))

ipcMain.handle('showMessageBox', (evt, opts) => dialog.showMessageBox(opts))

const sleep = (() => {
	let _blockId = 0

	return {
		disable() {
			_blockId = powerSaveBlocker.start('prevent-display-sleep')
		},
		enable() {
			powerSaveBlocker.stop(_blockId)
		}
	}
})()

ipcMain.on('disableSleep', sleep.disable)
ipcMain.on('enableSleep', sleep.enable)

const togglePrefsIPC = state => () => {
	Menu.getApplicationMenu().getMenuItemById('Preferences').enabled = state
}

ipcMain.on('enablePrefs', togglePrefsIPC(true))
ipcMain.on('disablePrefs', togglePrefsIPC(false))

const setContextMenu = () => {
	const textEditor = new Menu()
	let pos = [0, 0]
	let inspectMenu = []

	const inspect = !devtools ? [] : [
		new MenuItem({
			id: 0,
			label: 'Inspect Element',
			click() {
				BrowserWindow.getFocusedWindow().inspectElement(...pos)
			}
		}),
		new MenuItem({ type: 'separator' })
	]

	const textEditorItems = [
		...inspect,
		new MenuItem({ role: 'cut' }),
		new MenuItem({ role: 'copy' }),
		new MenuItem({ role: 'paste' }),
		new MenuItem({ type: 'separator' }),
		new MenuItem({ role: 'selectAll' })
	]

	if (devtools) {
		inspectMenu = new Menu()
		inspectMenu.append(...inspect)
	}

	for (const item of textEditorItems) {
		textEditor.append(item)
	}

	return (evt, { isTextElement, x, y }) => {
		pos = [x, y]

		if (isTextElement) {
			textEditor.popup(BrowserWindow.getFocusedWindow())
		} else if (devtools) {
			inspectMenu.popup(BrowserWindow.getFocusedWindow())
		}
	}
}

ipcMain.handle('getContextMenu', setContextMenu())
