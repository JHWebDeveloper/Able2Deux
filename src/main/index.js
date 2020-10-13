import { app, BrowserWindow, Menu, ipcMain } from 'electron'
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
import { render, cancelRender, cancelAllRenders } from './modules/formatting/formatting'
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

const createURL = view => url.format(dev ? {
	protocol: 'http:',
	host: 'localhost:3000',
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
		splashWin.close()
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

	mainWin.loadURL(createURL('index'))

	Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate))

	mainWin.on('ready-to-show', () => {
		mainWin.show()
		splashWin.close()
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
			{ role: 'redo'},
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

//if (dev || process.env.devtools) {
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
//}

// ---- IPC ROUTES ----

async function getURLInfoIPC (evt, data) {
	const { id } = data

	try {
		evt.reply(`URLInfoRecieved_${id}`, await getURLInfo(data))
	} catch (err) {
		console.error(err)
		evt.reply(`URLInfoErr_${id}`, err)
	}
}

async function requestDownloadIPC (evt, data) {
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

async function cancelDownloadIPC (evt, id) {
	try {
		await cancelDownload(id)
	} catch (err) {
		console.error(err)
	}
}

async function stopLiveDownloadIPC (evt, id) {
	try {
		await stopLiveDownload(id)
	} catch (err) {
		console.error(err)
	}
}

async function checkFileTypeIPC (evt, data) {
	try {
		evt.reply(`fileTypeFound_${data.id}`, await checkFileType(data.file))
	} catch (err) {
		console.error(err)
		evt.reply(`fileTypeErr_${data.id}`, err)
	}
}

async function requestUploadIPC (evt, data) {
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

async function saveScreenRecordingIPC (evt, data) {
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

async function removeMediaFileIPC (evt, id) {
	try {
		await scratchDisk.imports.clear(id)
	} catch (err) {
		console.error(err)
	}
}

async function initPreviewIPC (evt, data) {
	try {
		return updatePreviewSourceImage(data)
	} catch (err) {
		console.error(err)
	}
}

async function requestPreviewStillIPC (evt, data) {
	try {
		const dataURL = await previewStill(data)

		evt.reply('previewStillCreated', dataURL)
	} catch (err) {
		if (!/^Error: ffmpeg (was killed with signal SIGKILL)|(exited with code 1)/.test(err.toString())) {
			console.error(err)
		}
	}
}

async function checkDirectoryExistsIPC (evt, dir) {
	try {
		return fileExistsPromise(dir)
	} catch (err) {
		console.error(err)
		return false
	}
}

async function requestRenderIPC (evt, data) {
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

async function cancelRenderIPC (evt, id) {
	try {
		return cancelRender(id)
	} catch (err) {
		console.error(err)
	}
}

async function cancelAllRendersIPC () {
	try {
		return cancelAllRenders()
	} catch (err) {
		console.error(err)
	}
}

async function clearTempFilesIPC () {
	try {
		return scratchDisk.clearAll()
	} catch (err) {
		console.error(err)
	}
}

async function requestPrefsIPC (evt) {
	try {
		evt.reply('prefsRecieved', await loadPrefs())
	} catch (err) {
		console.error(err)
		evt.reply('prefsErr', err)
	}
}

async function savePrefsIPC (evt, prefs) {
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

async function retryUpdate () {
	autoUpdater.autoDownload = true
	autoUpdater.checkForUpdatesAndNotify()
}

async function checkForUpdateBackup () {
	const version = await checkForUpdate()

	if (version) {
		await createUpdateWindow()
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
ipcMain.on('cancelAllRenders', cancelAllRendersIPC)
ipcMain.on('clearTempFiles', clearTempFilesIPC)
ipcMain.on('requestPrefs', requestPrefsIPC)
ipcMain.handle('requestDefaultPrefs', getDefaultPrefs)
ipcMain.on('savePrefs', savePrefsIPC)
ipcMain.on('retryUpdate', retryUpdate)
ipcMain.on('checkForUpdateBackup', checkForUpdateBackup)
