import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, powerSaveBlocker, systemPreferences } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import url from 'url'
import path from 'path'

import { initPreferences, loadPrefs, savePrefs, getDefaultPrefs } from './modules/preferences/preferences'
import { initScratchDisk, scratchDisk, updateScratchDisk } from './modules/scratchDisk'
import { getURLInfo, downloadVideo, cancelDownload, stopLiveDownload } from './modules/acquisition/download'
import { upload } from './modules/acquisition/upload'
import { saveScreenRecording } from './modules/acquisition/saveScreenRecording'
import { checkFileType, getMediaInfo } from './modules/acquisition/mediaInfo'
import previewStill from './modules/formatting/preview'
import updatePreviewSourceImage from './modules/formatting/updatePreviewSourceImage'
import { render, cancelRender } from './modules/formatting/formatting'
import { fileExistsPromise } from './modules/utilities'

const dev = process.env.NODE_ENV === 'development'
const mac = process.platform === 'darwin'
let splashWin = false
let updateWin = false
let mainWin = false
let preferences = false
let help = false

process.noDeprecation = !dev

autoUpdater.autoDownload = false
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

log.catchErrors({ showDialog: false })

if (!dev) console.error = log.error

const openWindow = opts => new BrowserWindow({
	show: false,
	backgroundColor: '#eee',
	webPreferences: {
		nodeIntegration: dev,
		contextIsolation: !dev,
		enableEval: false,
		enableRemoteModule: true,
		preload: dev
			? path.join(__dirname, 'preload', 'babelRegister.js')
			: path.join(__dirname, 'preload.js')
	},
	...opts
})

const createURL = (view = 'index') => url.format(dev ? {
	protocol: 'http:',
	hostname: 'localhost',
	port: process.env.PORT,
	pathname: `${view}.html`,
	slashes: true
} : {
	protocol: 'file:',
	pathname: path.join(__dirname, 'renderer', `${view}.html`),
	slashes: true
})

const checkForUpdate = () => {
	if (!app.isPackaged || mac) return Promise.resolve(false)

	return new Promise((resolve, reject) => {
		autoUpdater.on('update-available', ({ version }) => resolve(version))
		autoUpdater.on('update-not-available', () => resolve(false))
		autoUpdater.on('error', err => reject(err))
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

	autoUpdater.on('error', () => {
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
	let version = ''

	createSplashWindow()

	try {
		await initPreferences()
		await initScratchDisk()

		version = await checkForUpdate()
	} catch (err) {
		console.error(err)
	}

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

const splashWindowMenuTemplate = [{
	label: app.name,
	submenu: [
		{
			label: 'About',
			role: 'about'
		},
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
		submenu: [
			{
				label: 'About',
				role: 'about'
			},
			...prefsMenuItem,
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
	}] : [],
	{
		label: 'File',
		submenu: [
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

if (dev || process.env.DEVTOOLS) {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toggle DevTools',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools()
				}
			},
			{
				role: 'reload'
			}
		]
	})
}

// ---- IPC ROUTES ----

const getURLInfoIPC = async (evt, data) => {
	const { id } = data

	try {
		evt.reply(`URLInfoRecieved_${id}`, await getURLInfo(data))
	} catch (err) {
		console.error(err)
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
		console.error(err)
		evt.reply(`downloadErr_${id}`, err)
	}
}

const cancelDownloadIPC = (evt, id) => cancelDownload(id)

const stopLiveDownloadIPC = (evt, id) => stopLiveDownload(id)

const checkFileTypeIPC = async (evt, data) => {
	try {
		evt.reply(`fileTypeFound_${data.id}`, await checkFileType(data.file))
	} catch (err) {
		console.error(err)
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
		console.error(err)
		evt.reply(`uploadErr_${id}`, err)
	}
}

const saveScreenRecordingIPC = async (evt, data) => {
	const { id, screenshot } = data

	try {
		const tempFilePath = await saveScreenRecording(data)
		const mediaData = await getMediaInfo(id, tempFilePath, screenshot ? 'image' : 'video', 60)
		
		evt.reply(`screenRecordingSaved_${id}`, mediaData)
	} catch (err) {
		console.error(err)
		evt.reply(`saveScreenRecordingErr_${id}`, err)
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
		return updatePreviewSourceImage(data)
	} catch (err) {
		console.error(err)
	}
}

const requestPreviewStillIPC = async (evt, data) => {
	try {
		const dataURL = await previewStill(data)

		evt.reply('previewStillCreated', dataURL)
	} catch (err) {
		if (!/^Error: ffmpeg (was killed with signal SIGKILL)|(exited with code 1)/.test(err.toString())) {
			console.error(err)
		}
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
		if (err.toString() !== 'Error: ffmpeg was killed with signal SIGKILL') {
			console.error(err)
		}

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
		evt.reply('prefsErr', err)
	}
}

const savePrefsIPC = async (evt, prefs) => {
	try {
		await savePrefs(prefs)
		await updateScratchDisk()

		evt.reply('prefsSaved')
		mainWin.webContents.send('syncPrefs', prefs)
	} catch (err) {
		console.error(err)
		evt.reply('savePrefsErr', err)
	}
}

const retryUpdate = async () => {
	autoUpdater.autoDownload = true
	autoUpdater.checkForUpdatesAndNotify()
}

const checkForUpdateBackup = async () => {
	const version = await checkForUpdate()

	if (version) {
		createUpdateWindow()
		mainWin.close()
	}
}

ipcMain.on('getURLInfo', getURLInfoIPC)
ipcMain.on('requestDownload', requestDownloadIPC)
ipcMain.on('cancelDownload', cancelDownloadIPC)
ipcMain.on('stopLiveDownload', stopLiveDownloadIPC)
ipcMain.on('checkFileType', checkFileTypeIPC)
ipcMain.on('requestUpload', requestUploadIPC)
ipcMain.on('saveScreenRecording', saveScreenRecordingIPC)
ipcMain.on('removeMediaFile', removeMediaFileIPC)
ipcMain.handle('initPreview', initPreviewIPC)
ipcMain.on('requestPreviewStill', requestPreviewStillIPC)
ipcMain.handle('checkDirectoryExists', checkDirectoryExistsIPC)
ipcMain.on('requestRender', requestRenderIPC)
ipcMain.on('cancelRender', cancelRenderIPC)
ipcMain.on('clearTempFiles', clearTempFilesIPC)
ipcMain.on('requestPrefs', requestPrefsIPC)
ipcMain.handle('requestDefaultPrefs', getDefaultPrefs)
ipcMain.on('savePrefs', savePrefsIPC)
ipcMain.on('retryUpdate', retryUpdate)
ipcMain.on('checkForUpdateBackup', checkForUpdateBackup)


// ----  REMOTE MODULE REPLACEMENTS ----

ipcMain.handle('getVersion', () => app.getVersion())

ipcMain.on('bringToFront', () => {
	mainWin.show()
})

ipcMain.on('closePrefs', () => {
	preferences.close()
})

ipcMain.on('hide', () => {
	mainWin.hide()
})

ipcMain.on('quit', () => {
	app.exit(0)
})

ipcMain.handle('showOpenDialog', (evt, opts) => dialog.showOpenDialog(opts))

ipcMain.handle('showMessageBox', (evt, opts) => dialog.showMessageBox(opts))

ipcMain.handle('screenAccess', () => systemPreferences.getMediaAccessStatus('screen'))

const sleep = (() => {
	let _blockId = false

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

ipcMain.on('enablePrefs', () => {
	Menu.getApplicationMenu().getMenuItemById('Preferences').enabled = true
})

ipcMain.on('disablePrefs', () => {
	Menu.getApplicationMenu().getMenuItemById('Preferences').enabled = false
})

const setContextMenu = () => {
	const textEditor = new Menu()
	const dev = process.env.NODE_ENV === 'development' || process.env.DEVTOOLS
	const pos = { x: 0, y: 0 }
	let inspectMenu = []

	const inspect = !dev ? [] : [
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

	if (dev) {
		inspectMenu = new Menu()
		inspectMenu.append(...inspect)
	}

	for (const item of textEditorItems) {
		textEditor.append(item)
	}

	return (evt, { isTextElement, x, y }) => {
		pos.x = x
		pos.y = y

		if (isTextElement) {
			textEditor.popup(BrowserWindow.getFocusedWindow())
		} else if (dev) {
			inspectMenu.popup(BrowserWindow.getFocusedWindow())
		}
	}
}

ipcMain.handle('getContextMenu', setContextMenu())
