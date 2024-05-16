import { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, powerSaveBlocker, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { pathToFileURL } from 'url'
import path from 'path'

import { initDataStores, loadPrefs, loadPresets, savePrefs, getDefaultPrefs, loadTheme, getPresetAttributes, createPreset, updatePreset, savePresets, saveWorkspace, saveWorkspacePanel, loadWorkspace } from './modules/preferences/preferences'
import { scratchDisk } from './modules/scratchDisk'
import { getURLInfo, downloadVideo, cancelDownload, stopLiveDownload } from './modules/acquisition/download'
import { upload } from './modules/acquisition/upload'
import { getRecordSources, saveScreenRecording } from './modules/acquisition/screenRecorder'
import { checkFileType, getMediaInfo } from './modules/acquisition/mediaInfo'
import { getThumbnailBase64 } from './modules/acquisition/thumbnails'
import { validateDirectories } from './modules/formatting/validateDirectories'
import { renderPreview, copyPreviewToImports } from './modules/formatting/preview'
import { render, cancelRender } from './modules/formatting/formatting'
import { FACEBOOK_URL, LICENSE_URL, SUPPORTED_EXTENSIONS } from './modules/constants'
import { clamp, delay } from './modules/utilities'

const IS_MAC = process.platform === 'darwin'
const IS_DEV = process.env.NODE_ENV === 'development'
const DEVTOOLS_ON = IS_DEV || process.env.DEVTOOLS

process.noDeprecation = !IS_DEV

autoUpdater.autoDownload = false
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

if (!IS_DEV) {
	log.errorHandler.startCatching({ showDialog: false })
	console.error = log.error
}

const openWindow = (opts = {}) => new BrowserWindow({
	show: false,
	backgroundColor: '#eee',
	webPreferences: {
		nodeIntegration: IS_DEV,
		contextIsolation: !IS_DEV,
		enableEval: false,
		enableRemoteModule: false,
		sandbox: false,
		preload: IS_DEV
			? path.join(__dirname, 'preload', 'babelRegister.js')
			: path.join(__dirname, 'preload.js')
	},
	...opts
})

const createModalWindowOptions = (w, h, parent) => ({
	modal: true,
	parent,
	width: w,
	minWidth: w,
	height: h,
	minHeight: h,
	useContentSize: true
})

const createURL = (view = 'index') => {
	const { href } = IS_DEV
		? new URL(`http://localhost:${process.env.PORT}/${view}.html`)
		: pathToFileURL(path.join(__dirname, 'renderer', `${view}.html`))

	return href
}

const removeListeners = (...listeners) => {
	for (const listener of listeners) {
		ipcMain.removeAllListeners(listener)
	}
}

// ---- SPLASH AND UPDATE WINDOWS ------------

let splashWin = false
let updateWin = false

const splashWindowOpts = {
	width: 400,
	height: 400,
	resizable: IS_DEV,
	frame: false,
	maximizable: false
}

const createSplashWindow = () => {
	splashWin = openWindow(splashWindowOpts)

	if (IS_MAC) Menu.setApplicationMenu(Menu.buildFromTemplate(splashWindowMenuTemplate))

	splashWin.on('ready-to-show', () => {
		splashWin.show()
	})

	splashWin.on('close', () => splashWin = false)
	splashWin.loadURL(createURL('splash'))
}

const createUpdateWindow = version => {
	ipcMain.on('quit', () => {
		app.exit(0)
	})

	updateWin = openWindow(splashWindowOpts)

	updateWin.on('ready-to-show', () => {
		updateWin.show()
		if (splashWin) splashWin.close()
		autoUpdater.downloadUpdate()
		updateWin.webContents.send('updateStarted', version)
	})

	updateWin.on('close', () => {
		ipcMain.removeAllListeners('quit')
		updateWin = false
	})

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
	const { windowWidth, windowHeight } = await loadWorkspace()

	mainWin = openWindow({
		width: windowWidth,
		height: windowHeight,
		minWidth: IS_MAC ? 746 : 762,
		minHeight: 624
	})

	mainWin.loadURL(createURL())

	Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate))

	mainWin.on('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		if (!IS_DEV) await delay(3000)

		mainWin.show()

		if (splashWin) splashWin.close()
		if (IS_DEV) mainWin.webContents.openDevTools()

		if (openWithQueue.length) {
			mainWin.webContents.send('openWith', {
				files: openWithQueue
			})
		}

		openWithQueue = false
	})

	mainWin.on('close', () => mainWin = false)
}

// ---- RENDER QUEUE WINDOW ------------

let renderQueue = false

const createRenderQueueWindow = async ({ media, batchName, saveLocations = [] }) => {
	const { abort, syncPrefs, directories } = await validateDirectories(saveLocations)

	if (abort) return false
	if (syncPrefs) mainWin.webContents.send('syncPrefs', await loadPrefs())

	windowOpeningMenuOptions.disable()

	ipcMain.handleOnce('getMediaToRender', () => ({ media, batchName, directories }))

	ipcMain.on('requestRender', async (evt, data) => {
		try {
			await render(data, renderQueue)
	
			evt.reply(`renderComplete_${data.id}`)
		} catch (err) {
			evt.reply(`renderFailed_${data.id}`, err)
		}
	})
	
	ipcMain.on('cancelRender', (evt, id) => cancelRender(id))

	ipcMain.on('closeRenderQueue', async (evt, startOver) => {
		try {
			await Promise.all([
				startOver ? scratchDisk.previews.clear() : Promise.resolve(),
				scratchDisk.exports.clear()
			])
		} catch (err) {
			console.error(err)
		}

		if (startOver) mainWin.webContents.send('startOver')
		renderQueue.close()
	})

	renderQueue = openWindow({
		...createModalWindowOptions(700, clamp(media.length, 4, 10) * 47 + 125, mainWin),
		minHeight: 313
	})

	renderQueue.loadURL(createURL('render_queue'))

	renderQueue.once('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		renderQueue.show()
	})

	renderQueue.once('close', () => {
		ipcMain.removeHandler('getMediaToRender')
		removeListeners('requestRender', 'cancelRender', 'closeRenderQueue')
		renderQueue = false
		windowOpeningMenuOptions.enable()
	})

	renderQueue.setMenu(null)
}

// ---- PREFERENCES WINDOW ------------

let preferences = false

const createPrefsWindow = () => {
	windowOpeningMenuOptions.disable()

	ipcMain.handle('requestDefaultPrefs', getDefaultPrefs)

	ipcMain.on('clearScratchDisks', async evt => {
		try {
			await scratchDisk.clearAll()
	
			mainWin.webContents.send('startOver', {
				clearUndos: true
			})
	
			evt.reply('scratchDisksCleared')
		} catch (err) {
			console.error(err)
			evt.reply('clearScratchErr', new Error('An error occurred while attempting to clear scratch disks.'))
		}
	})

	ipcMain.on('closePrefs', () => {
		preferences.close()
	})

	preferences = openWindow(createModalWindowOptions(700, 624, mainWin))

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
		ipcMain.removeHandler('requestDefaultPrefs')
		removeListeners('clearScratchDisks', 'closePrefs')
		preferences = false
		windowOpeningMenuOptions.enable()
	})

	preferences.setMenu(null)
}

// ---- PRESETS WINDOW ------------

let presets = false

const createPresetsWindow = () => {
	windowOpeningMenuOptions.disable()

	ipcMain.on('savePresets', async (evt, data) => {
		try {
			await savePresets(data)
	
			mainWin.webContents.send('syncPresets', await loadPresets({
				referencesOnly: true,
				presorted: true
			}))
	
			evt.reply('presetsSaved')
		} catch (err) {
			console.error(err)
			evt.reply('savePresetsErr', new Error('An error occurred while attempting to save presets.'))
		}
	})

	ipcMain.on('closePresets', () => {
		presets.close()
	})

	presets = openWindow(createModalWindowOptions(700, 672, mainWin))

	presets.loadURL(createURL('presets'))

	presets.on('ready-to-show', async () => {
		try {
			await loadTheme()
		} catch (err) {
			console.error(err)
		}

		presets.show()
	})

	presets.on('close', () => {
		removeListeners('savePresets', 'closePresets')
		presets = false
		windowOpeningMenuOptions.enable()
	})

	presets.setMenu(null)
}

// ---- SAVE AS PRESET WINDOW ------------

let presetSaveAs = false

const createPresetSaveAsWindow = presetData => {
	windowOpeningMenuOptions.disable()

	ipcMain.handleOnce('getPresetToSave', () => presetData)

	ipcMain.on('savePreset', async (evt, data) => {
		try {
			if (data.saveType === 'newPreset') {
				await createPreset(data)
			} else {
				await updatePreset(data)
			}
	
			mainWin.webContents.send('syncPresets', await loadPresets({
				referencesOnly: true,
				presorted: true
			}))
			
			evt.reply('presetSaved')
		} catch (err) {
			console.error(err)
			evt.reply('savePresetErr', new Error('An error occurred while attempting to save preset.'))
		}
	})

	ipcMain.on('closePresetSaveAs', () => {
		presetSaveAs.close()
	})

	presetSaveAs = openWindow(createModalWindowOptions(400, 648, mainWin))

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
		removeListeners('savePreset', 'closePresetSaveAs')
		presetSaveAs = false
		windowOpeningMenuOptions.enable()
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
		minWidth: IS_MAC ? 746 : 762,
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

const checkForUpdate = () => {
	if (!app.isPackaged || IS_MAC) return Promise.resolve(false)

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

const startApp = async () => {
	createSplashWindow()

	try {
		await initDataStores()
		await scratchDisk.init()
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
	if (!IS_MAC) app.quit()
})

app.on('activate', () => {
	if (!mainWin && !splashWin && !updateWin) createMainWindow()
})

let openWithQueue = []

app.on('open-file', (evt, file) => {
	if (renderQueue) {
		return mainWin.webContents.send('openWith', { block: true })
	}

	const fileData = {
		name: path.basename(file),
		path: file
	}

	if (mainWin) {
		mainWin.webContents.send('openWith', {
			files: [fileData]
		})
	} else {
		openWithQueue.push(fileData)
	}
})

// ---- MENU CONFIG ------------

const windowOpeningMenuOptions = (() => {
	const menuOptionIds = ['edit_preferences', 'edit_presets', 'file_open', 'file_open_import_cache']

	const toggleAllOptions = enabled => {
		for (const id of menuOptionIds) {
			Menu.getApplicationMenu().getMenuItemById(id).enabled = enabled
		}
	}

	return {
		enable() { toggleAllOptions(true) },
		disable() { toggleAllOptions(false) }
	}
})()

const openFiles = async () => {
	const { filePaths, canceled } = await dialog.showOpenDialog({
		filters: [
			{ name: 'All Media Files', extensions: SUPPORTED_EXTENSIONS.all },
			{ name: 'Video Files', extensions: SUPPORTED_EXTENSIONS.video },
			{ name: 'Image Files', extensions: SUPPORTED_EXTENSIONS.images },
			{ name: 'Audio Files', extensions: SUPPORTED_EXTENSIONS.audio },
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

const prefsMenuItem = [
	{ type: 'separator' },
	{
		label: 'Preferences',
		id: 'edit_preferences',
		accelerator: 'CmdOrCtrl+,',
		click: createPrefsWindow
	}
]

const mainMenuTemplate = [
	...IS_MAC ? [{
		label: app.name,
		submenu: appleSubmenu(prefsMenuItem)
	}] : [],
	{
		label: 'File',
		submenu: [
			{
				label: 'Open',
				id: 'file_open',
				accelerator: 'CmdOrCtrl+O',
				async click() {
					const files = await openFiles()
					if (files.length) mainWin.webContents.send('openWith', files)
				}
			},
			{ type: 'separator' },
			{
				label: 'Open Import Cache',
				id: 'file_open_import_cache',
				click() {
					mainWin.webContents.send('openImportCache')
				}
			},
			{ type: 'separator' },
			IS_MAC ? { role: 'close' } : { role: 'quit' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				label: 'Undo',
				accelerator: 'CmdOrCtrl+Z',
				click() {
					BrowserWindow.getFocusedWindow().webContents.send('changeStateHistory', 'undo')
				}
			},
			{
				label: 'Redo',
				accelerator: 'CmdOrCtrl+Shift+Z',
				click() {
					BrowserWindow.getFocusedWindow().webContents.send('changeStateHistory', 'redo')
				}
			},
			{
				label: 'Redo',
				accelerator: 'CmdOrCtrl+R',
				visible: false,
				acceleratorWorksWhenHidden: true,
				click() {
					BrowserWindow.getFocusedWindow().webContents.send('changeStateHistory', 'redo')
				}
			},
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ type: 'separator' },
			{ role: 'selectall' },
			{ type: 'separator' },
			...IS_MAC ? [] : prefsMenuItem,
			{
				label: 'Presets',
				id: 'edit_presets',
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
			},
			{
				label: 'Able2 on Facebook',
				click() {
					shell.openExternal(FACEBOOK_URL)
				}
			},
			{ type: 'separator' },
			{
				label: 'View License',
				click() {
					shell.openExternal(LICENSE_URL)
				}
			}
		]
	}
]

if (DEVTOOLS_ON) {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toggle DevTools',
				click(_, focusedWindow) {
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

// ---- IPC ROUTES: FORMATTING/PREVIEW ------------

ipcMain.handle('requestThumbnail', async (evt, id) => getThumbnailBase64(id))

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

ipcMain.on('openRenderQueue', async (evt, data) => {
	try {
		await createRenderQueueWindow(data)
		evt.reply('renderQueueOpened')
	} catch (err) {
		console.error(err)
		evt.reply('openRenderQueueErr', new Error('An error occurred while attempting to remove missing save location(s).'))
	}
})

// ---- IPC ROUTES: PREFERENCES ------------

ipcMain.on('requestPrefs', async evt => {
	try {
		evt.reply('prefsRecieved', await loadPrefs())
	} catch (err) {
		console.error(err)
		evt.reply('prefsErr', new Error('An error occurred while attempting to load preferences.'))
	}
})

ipcMain.on('savePrefs', async (evt, data) => {
	try {
		await savePrefs(data)

		try {
			await Promise.all([
				scratchDisk.update(),
				loadTheme()
			])
		} catch (err) {
			console.error(err)
		}

		mainWin.webContents.send('syncPrefs', await loadPrefs())

		evt.reply('prefsSaved')
	} catch (err) {
		console.error(err)
		evt.reply('savePrefsErr', new Error('An error occurred while attempting to save preferences.'))
	}
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
	createPresetSaveAsWindow(data.preset)
})

ipcMain.on('openPresets', createPresetsWindow)

// ---- IPC ROUTES: WORKSPACE ------------

ipcMain.on('requestWorkspace', async evt => {
	try {
		evt.reply('workspaceRecieved', await loadWorkspace())
	} catch (err) {
		console.error(err)
		evt.reply('workspaceErr', new Error('An error occurred while attempting to workspace settings.'))
	}
})

ipcMain.on('saveWorkspace', async (evt, data) => {
	try {	
		await saveWorkspace(data)
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('saveWorkspacePanel', async (evt, data) => {	
	try {
		await saveWorkspacePanel(data)
	} catch (err) {
		console.error(err)
	}
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

// ---- IPC ROUTES: APP ------------

ipcMain.handle('getVersion', () => app.getVersion())

ipcMain.on('bringToFront', () => {
	mainWin.show()
})

ipcMain.on('hide', () => {
	mainWin.hide()
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

const setContextMenu = () => {
	const textEditor = new Menu()
	let pos = [0, 0]
	let inspectMenu = []

	const inspect = !DEVTOOLS_ON ? [] : [
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

	if (DEVTOOLS_ON) {
		inspectMenu = new Menu()
		inspectMenu.append(...inspect)
	}

	for (const item of textEditorItems) {
		textEditor.append(item)
	}

	return (evt, { isTextElement, x, y }) => {
		const focusedWindow = BrowserWindow.getFocusedWindow()

		if (!focusedWindow) return false

		pos = [x, y]

		if (isTextElement) {
			textEditor.popup(focusedWindow)
		} else if (DEVTOOLS_ON) {
			inspectMenu.popup(focusedWindow)
		}
	}
}

ipcMain.handle('getContextMenu', setContextMenu())
