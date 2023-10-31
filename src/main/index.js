import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, powerSaveBlocker } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { pathToFileURL } from 'url'
import path from 'path'

import { initPreferencesAndPresets, loadPrefs, loadPresets, savePrefs, getDefaultPrefs, loadTheme, getPresetAttributes, createPreset, updatePreset, savePresets } from './modules/preferences/preferences'
import { initScratchDisk, scratchDisk, updateScratchDisk } from './modules/scratchDisk'
import { getURLInfo, downloadVideo, cancelDownload, stopLiveDownload } from './modules/acquisition/download'
import { upload } from './modules/acquisition/upload'
import { getRecordSources, saveScreenRecording } from './modules/acquisition/screenRecorder'
import { checkFileType, getMediaInfo } from './modules/acquisition/mediaInfo'
import { renderPreview, copyPreviewToImports } from './modules/formatting/preview'
import { render, cancelRender } from './modules/formatting/formatting'
import { fileExistsPromise, supportedExtensions } from './modules/utilities'

const mac = process.platform === 'darwin'
const dev = process.env.NODE_ENV === 'development'
const devtools = dev || process.env.DEVTOOLS

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
		sandbox: false,
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

// ---- SPLASH AND UPDATE WINDOWS ------------

let splashWin = false
let updateWin = false

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

// ---- MAIN WINDOW ------------

let mainWin = false

const createMainWindow = async () => {
	const { windowWidth, windowHeight } = await loadPrefs()

	mainWin = openWindow({
		width: windowWidth,
		height: windowHeight,
		minWidth: mac ? 746 : 762,
		minHeight: 620
	})

	mainWin.loadURL(createURL())

	Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate))

	mainWin.on('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		mainWin.show()

		if (splashWin) splashWin.close()
		if (dev) mainWin.webContents.openDevTools()

		if (openWithQueue.length) {
			mainWin.webContents.send('openWith', openWithQueue)
		}

		openWithQueue = false
	})

	mainWin.on('close', () => mainWin = false)
}

// ---- PREFERENCES WINDOW ------------

let preferences = false

const createPrefsWindow = () => {
	enablePrefsMenu(false)

	preferences = openWindow({
		parent: mainWin,
		width: mac ? 746 : 762,
		height: 648,
		resizable: dev,
		modal: true
	})

	preferences.loadURL(createURL('preferences'))

	preferences.once('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		preferences.show()
	})

	preferences.on('close', () => {
		enablePrefsMenu(true)
		preferences = false
	})

	preferences.setMenu(null)
}

// ---- PRESETS WINDOW ------------

let presets = false

const createPresetsWindow = () => {
	const width = 770
	const height = 794

	presets = openWindow({
		parent: mainWin,
		width,
		height,
		minWidth: width,
		minHeight: height,
		resizable: dev,
		modal: true
	})

	presets.loadURL(createURL('presets'))

	presets.once('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		presets.show()
	})

	presets.on('close', () => {
		presets = false
	})

	presets.setMenu(null)
}

// ---- SAVE AS PRESET WINDOW ------------

let presetSaveAs = false

const createPresetSaveAsWindow = () => {
	ipcMain.once('closePresetSaveAs', () => {
		presetSaveAs.close()
	})

	presetSaveAs = openWindow({
		parent: mainWin,
		width: 400,
		height: 648,
		resizable: dev,
		modal: true
	})

	presetSaveAs.loadURL(createURL('preset_save_as'))

	presetSaveAs.once('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		presetSaveAs.show()
	})

	presetSaveAs.on('close', () => {
		ipcMain.removeHandler('getPresetToSave')
		ipcMain.removeAllListeners('closePresetSaveAs')
		presetSaveAs = false
	})

	presetSaveAs.setMenu(null)
}

// ---- HELP WINDOW ------------

let help = false

const createHelpWindow = () => {
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

// ---- START ABLE2 ------------

const startApp = async () => {
	createSplashWindow()

	try {
		await initPreferencesAndPresets()
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

let openWithQueue = []

app.on('open-file', (evt, file) => {
	const fileData = {
		name: path.basename(file),
		path: file
	}

	if (mainWin) {
		mainWin.webContents.send('openWith', [fileData])
	} else {
		openWithQueue.push(fileData)
	}
})


// ---- MENU CONFIG ------------

const openFiles = async () => {
	const { filePaths, canceled } = await dialog.showOpenDialog({
		filters: [
			{ name: 'All Media Files', extensions: [ ...supportedExtensions.images, ...supportedExtensions.video, ...supportedExtensions.audio ] },
			{ name: 'Video Files', extensions: supportedExtensions.video },
			{ name: 'Image Files', extensions: supportedExtensions.images },
			{ name: 'Audio Files', extensions: supportedExtensions.audio },
			{ name: 'All Files', extensions: ['*'] }
		],
		properties: ['openFile', 'multiSelections', 'createDirectory']
	})

	return canceled ? [] : filePaths.map(filePath => ({
		name: path.basename(filePath),
		path: filePath
	}))
}

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
		click: createPrefsWindow
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
				label: 'Open',
				accelerator: 'CmdOrCtrl+O',
				async click() {
					const files = await openFiles()
					if (files.length) mainWin.webContents.send('openWith', files)
				}
			},
			{ type: 'separator' },
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
			{ type: 'separator' },
			...mac ? [] : prefsMenuItem,
			{
				label: 'Presets',
				click: createPresetsWindow
			}
		]
	},
	{
		label: 'Help',
		submenu: [
			{
				label: 'Able2 Help',
				click: createHelpWindow
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

// ---- IPC ROUTES: DOWNLOAD ------------

ipcMain.on('getURLInfo', async (evt, data) => {
	const { id } = data

	try {
		evt.reply(`URLInfoRecieved_${id}`, await getURLInfo(data))
	} catch (err) {
		evt.reply(`URLInfoErr_${id}`, err)
	}
})

ipcMain.on('requestDownload', async (evt, data) => {
	const { id } = data

	try {
		const tempFilePath = await downloadVideo(data, mainWin)
		const mediaData = await getMediaInfo(id, tempFilePath)

		evt.reply(`downloadComplete_${id}`, mediaData)
	} catch (err) {
		evt.reply(`downloadErr_${id}`, err)
	}
})

ipcMain.on('cancelDownload', (evt, id) => cancelDownload(id))

ipcMain.on('stopLiveDownload', (evt, id) => stopLiveDownload(id))

// ---- IPC ROUTES: UPLOAD ------------

ipcMain.handle('openFiles', openFiles)

ipcMain.on('checkFileType', async (evt, data) => {
	try {
		evt.reply(`fileTypeFound_${data.id}`, await checkFileType(data.file))
	} catch (err) {
		evt.reply(`fileTypeErr_${data.id}`, err)
	}
})

ipcMain.on('requestUpload', async (evt, data) => {
	const { id, mediaType, hasAudio } = data

	try {
		const tempFilePath = await upload(data)
		const mediaData = await getMediaInfo(id, tempFilePath, { mediaType, hasAudio })

		evt.reply(`uploadComplete_${id}`, mediaData)
	} catch (err) {
		evt.reply(`uploadErr_${id}`, err)
	}
})

// ---- IPC ROUTES: SCREEN RECORD ------------

ipcMain.on('requestRecordSources', async evt => {
	try {
		evt.reply('recordSourcesFound', await getRecordSources())
	} catch (err) {
		console.error(err)
		evt.reply('requestRecordSourcesErr', new Error('An error occurred while attempting to load recordable sources.'))
	}
})

ipcMain.on('saveScreenRecording', async (evt, data) => {
	const { id, screenshot, fps } = data

	try {
		const tempFilePath = await saveScreenRecording(data)
		const streamData = screenshot && { mediaType: 'image', hasAudio: false }
		const mediaData = await getMediaInfo(id, tempFilePath, streamData, fps)
		
		evt.reply(`screenRecordingSaved_${id}`, mediaData)
	} catch (err) {
		console.error(err)
		evt.reply(`saveScreenRecordingErr_${id}`, new Error(`An error occurred while attempting to save screen${screenshot ? 'shot' : ' recording'}.`))
	}
})

// ---- IPC ROUTES: PREVIEW ------------

ipcMain.on('requestPreviewStill', async (evt, data) => {
	try {
		evt.reply('previewStillCreated', await renderPreview(data))
	} catch (err) {
		if (!/^Error: ffmpeg (was killed with signal SIGKILL)|(exited with code 1)/.test(err.toString())) {
			console.error(err)
		}
	}
})

ipcMain.on('copyPreviewToImports', async (evt, data) => {
	try {
		evt.reply('previewCopied', await copyPreviewToImports(data))
	} catch (err) {
		console.error(err)
		evt.reply('previewCopiedFailed', new Error('An error occurred while attempting to load screengrab.'))
	}
})

// ---- IPC ROUTES: RENDER ------------

ipcMain.on('requestRender', async (evt, data) => {
	try {
		await render(data, mainWin)

		evt.reply(`renderComplete_${data.id}`)
	} catch (err) {
		evt.reply(`renderFailed_${data.id}`, err)
	}
})

ipcMain.on('cancelRender', (evt, id) => cancelRender(id))

// ---- IPC ROUTES: PREFERENCES ------------

ipcMain.on('requestPrefs', async evt => {
	try {
		evt.reply('prefsRecieved', await loadPrefs())
	} catch (err) {
		console.error(err)
		evt.reply('prefsErr', new Error('An error occurred while attempting to load preferences.'))
	}
})

ipcMain.handle('requestDefaultPrefs', getDefaultPrefs)

ipcMain.on('savePrefs', async (evt, data) => {
	try {
		await savePrefs(data)

		try {
			await Promise.all([
				updateScratchDisk(),
				loadTheme()
			])
		} catch (err) {
			console.error(err)
		}

		const updatedPrefs = await loadPrefs()

		mainWin.webContents.send('syncPrefs', updatedPrefs)
		presets?.webContents?.send('syncPrefs', updatedPrefs)

		evt.reply('prefsSaved')
	} catch (err) {
		console.error(err)
		evt.reply('savePrefsErr', new Error('An error occurred while attempting to save preferences.'))
	}
})

ipcMain.on('savePrefsSilently', async (evt, data) => {
	try {
		const oldPrefs = await loadPrefs()
	
		await savePrefs({
			...oldPrefs,
			...data
		})
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('closePrefs', () => {
	preferences.close()
})

// ---- IPC ROUTES: PRESETS ------------

ipcMain.on('requestPresets', async (evt, data) => {
	try {
		evt.reply('presetsRecieved', await loadPresets(data))
	} catch (err) {
		console.error(err)
		evt.reply('presetsErr', new Error('An error occurred while attempting to load presets.'))
	}
})

ipcMain.on('getPresetAttributes', async (evt, data) => {
	try {
		evt.reply('presetAttributesRetrieved', await getPresetAttributes(data))
	} catch (err) {
		console.error(err)
		evt.reply('retrievePresetAttributesErr', new Error(`An error occurred while attempting to retrieve requested preset${data.presetIds.length > 1 ? 's' : ''}.`))
	}
})

ipcMain.on('openPresetSaveAs', async (evt, data) => {
	ipcMain.handleOnce('getPresetToSave', () => data.preset)
	createPresetSaveAsWindow()
})

ipcMain.on('savePreset', async (evt, data) => {
	try {
		if (data.saveType === 'newPreset') {
			await createPreset(data)
		} else {
			await updatePreset(data)
		}

		mainWin.webContents.send('syncPresets', loadPresets({
			referencesOnly: true,
			presorted: true
		}))

		if (presets) presets.webContents.send('syncPrefs', await loadPresets())
		
		evt.reply('presetSaved')
	} catch (err) {
		console.error(err)
		evt.reply('savePresetErr', new Error('An error occurred while attempting to save preset.'))
	}
})

ipcMain.on('savePresets', async (evt, data) => {
	try {
		await savePresets(data)

		const updatedPresets = await loadPresets({
			referencesOnly: true,
			presorted: true
		})

		mainWin.webContents.send('syncPresets', updatedPresets)
		presetSaveAs?.webContents?.send('syncPrefs', updatedPresets)

		evt.reply('presetsSaved')
	} catch (err) {
		console.error(err)
		evt.reply('savePresetsErr', new Error('An error occurred while attempting to save presets.'))
	}
})

ipcMain.on('closePresets', () => {
	presets.close()
})

// ---- IPC ROUTES: UPDATE ------------

ipcMain.on('retryUpdate', async () => {
	autoUpdater.autoDownload = true
	autoUpdater.checkForUpdatesAndNotify()
})

ipcMain.on('checkForUpdateBackup', async () => {
	try {
		const version = await checkForUpdate()
	
		if (version) {
			createUpdateWindow()
			mainWin.close()
		}
	} catch (err) {
		console.error(err)
	}
})

// ---- IPC ROUTES: UTILITY ------------

ipcMain.on('removeMediaFile', async (evt, id) => {
	try {
		await scratchDisk.imports.clear(id)
	} catch (err) {
		console.error(err)
	}
})

ipcMain.handle('checkDirectoryExists', async (evt, dir) => {
	try {
		return fileExistsPromise(dir)
	} catch (err) {
		console.error(err)
		return false
	}
})

ipcMain.on('clearTempFiles', async () => {
	try {
		return scratchDisk.clearAll()
	} catch (err) {
		console.error(err)
	}
})

// ---- IPC ROUTES: APP ------------

ipcMain.handle('getVersion', () => app.getVersion())

ipcMain.on('bringToFront', () => {
	mainWin.show()
})

ipcMain.on('hide', () => {
	mainWin.hide()
})

ipcMain.on('quit', () => {
	app.exit(0)
})

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

// ---- IPC ROUTES: DIALOG ------------

ipcMain.handle('showOpenDialog', (evt, opts) => dialog.showOpenDialog(opts))

ipcMain.handle('showMessageBox', (evt, opts) => dialog.showMessageBox(opts))

// ---- IPC ROUTES: MENU ------------

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
