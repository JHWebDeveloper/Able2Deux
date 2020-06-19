import electron, { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import url from 'url'
import path from 'path'

import { initExtDirectories, temp } from './modules/utilities/extFileHandlers'
import { getTitleFromURL, downloadVideo, cancelDownload } from './modules/aquisition/download'
import { checkFileType, upload } from './modules/aquisition/upload'
import { saveScreenRecording } from './modules/aquisition/saveScreenRecording'
import { getMediaInfo } from './modules/aquisition/mediaInfo'
import previewStill from './modules/render/preview'
import updatePreviewSourceImage from './modules/render/updatePreviewSourceImage'
import fileExistsPromise from './modules/utilities/fileExistsPromise'
import { render, cancelRender, cancelAllRenders } from './modules/render/render'
import { loadPrefs, savePrefs } from './modules/preferences/preferences'

const dev = process.env.NODE_ENV === 'development'
const mac = process.platform === 'darwin'
let splashWin = false
let updateWin = false
let mainWin = false
let preferences = false

const { app, BrowserWindow, Menu } = electron

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

log.catchErrors({ showDialog: false })

if (!dev) console.error = log.error

const openWindow = opts => new BrowserWindow({
	show: false,
	backgroundColor: '#eee',
	webPreferences: {
		nodeIntegration: dev,
		enableEval: false,
		preload: dev
			? path.join(__dirname, 'preload', 'babelRegister.js')
			: path.join(__dirname, 'preload.js')
	},
	...opts
})

const createURL = view =>  url.format(dev ? {
	protocol: 'http:',
	host: 'localhost:3000',
	pathname: `${view}.html`,
	slashes: true
} : {
	protocol: 'file:',
	pathname: path.join(__dirname, 'renderer', `${view}.html`),
	slashes: true
})

const checkForUpdate = () => dev ? Promise.resolve(false) : new Promise(resolve => {
	autoUpdater.on('update-available', ({ version }) => resolve(version))
	autoUpdater.on('update-not-available', () => resolve(false))
	autoUpdater.checkForUpdatesAndNotify()
})

const startWindowOpts = {
	width: 400,
	height: 400,
	resizable: dev,
	frame: false,
	maximizable: false
}

const createSplashWindow = () => new Promise(resolve => {
	splashWin = openWindow(startWindowOpts)

	splashWin.on('ready-to-show', () => {
		splashWin.show()
		resolve()
	})

	splashWin.on('close', () => splashWin = false)
	splashWin.loadURL(createURL('splash'))
})

const createUpdateWindow = version => new Promise(resolve => {
	updateWin = openWindow(startWindowOpts)

	updateWin.on('ready-to-show', () => {
		updateWin.show()
		updateWin.webContents.send('updateStarted', version)
		resolve()
	})

	updateWin.on('close', () => updateWin = false)

	autoUpdater.on('download-progress', ({ percent }) => {
		updateWin.webContents.send('updateProgress', percent)
	})
	
	autoUpdater.on('update-downloaded', autoUpdater.quitAndInstall)

	autoUpdater.on('error', () => {
		updateWin.webContents.send('updateError')
	})

	updateWin.loadURL(createURL('update'))
})

const createMainWindow = () => new Promise(resolve => {
	mainWin = openWindow({
		width: 746,
		height: 800,
		minWidth: 746,
		minHeight: 620
	})

	mainWin.loadURL(createURL('index'))

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

	Menu.setApplicationMenu(mainMenu)

	mainWin.on('ready-to-show', () => {
		mainWin.show()
		if (dev) mainWin.webContents.openDevTools()
		resolve()
	})

	mainWin.on('close', () => mainWin = false)
})

const startApp = async () => {
	await createSplashWindow()

	const responses = await Promise.all([
		checkForUpdate(),
		initExtDirectories()
	])

	const version = responses[0]

	if (version) {
		await createUpdateWindow(version)
	} else {
		await createMainWindow()
	}

	splashWin.close()
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

const prefsMenuItem = [
	{ type: 'separator' },
	{
		label: 'Preferences',
		accelerator: 'CmdOrCtrl+,',
		click() {
			preferences = openWindow({
				parent: mainWin,
				width: 755,
				height: 420,
				minWidth: 700,
				minHeight: 420,
				minimizable: false,
				maximizable: false
			})

			preferences.loadURL(createURL('preferences'))

			preferences.once('ready-to-show', preferences.show)

			preferences.on('close', () => preferences = false)

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
			...mac ?  [] : prefsMenuItem
		]
	}
]

if (dev) {
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

ipcMain.on('getTitleFromURL', async (evt, data) => {
	const { id, url } = data

	try {
		evt.reply(`titleRecieved_${id}`, await getTitleFromURL(url))
	} catch (err) {
		console.error(err)
		evt.reply(`titleErr_${id}`, err)
	}
})

ipcMain.on('requestDownload', async (evt, data) => {
	const { id } = data

	try {
		const tempFilePath = await downloadVideo(data, mainWin)
		const mediaData = await getMediaInfo(id, 'video', tempFilePath)

		evt.reply(`downloadComplete_${id}`, mediaData)
	} catch (err) {
		console.error(err)
		evt.reply(`downloadErr_${id}`, err)
	}
})

ipcMain.on('cancelDownload', async (evt, id) => {
	try {
		await cancelDownload(id)
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('checkFileType', async (evt, data) => {
	try {
		evt.reply(`fileTypeFound_${data.id}`, await checkFileType(data.file))
	} catch (err) {
		console.error(err)
		evt.reply(`fileTypeErr_${data.id}`, err)
	}
})

ipcMain.on('requestUpload', async (evt, data) => {
	const { id, mediaType } = data

	try {
		const tempFilePath = await upload(data)
		const mediaData = await getMediaInfo(id, mediaType, tempFilePath)

		evt.reply(`uploadComplete_${id}`, mediaData)
	} catch (err) {
		console.error(err)
		evt.reply(`uploadErr_${id}`, err)
	}
})

ipcMain.on('saveScreenRecording', async (evt, data) => {
	const { id } = data

	try {
		const tempFilePath = await saveScreenRecording(data)
		const mediaData = await getMediaInfo(id, 'video', tempFilePath)
		
		evt.reply(`screenRecordingSaved_${id}`, mediaData)
	} catch (err) {
		console.error(err)
		evt.reply(`saveScreenRecordingErr_${id}`, err)
	}
})

ipcMain.on('removeMediaFile', async (evt, id) => {
	try {
		await temp.imports.clear(id)
	} catch (err) {
		console.error(err)
	}
})

ipcMain.handle('initPreview', async (evt, data) => {
	try {
		return updatePreviewSourceImage(data)
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('requestPreviewStill', async (evt, data) => {
	try {
		const dataURL = await previewStill(data)

		evt.reply('previewStillCreated', dataURL)
	} catch (err) {
		if (err.toString() !== 'Error: ffmpeg was killed with signal SIGKILL') {
			console.error(err)
		}
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

ipcMain.on('requestRender', async (evt, data) => {
	try {
		await render(data, mainWin)

		evt.reply(`renderComplete_${data.id}`)
	} catch (err) {
		console.error(err)
		evt.reply(`renderFailed_${data.id}`, err)
	}
})

ipcMain.on('cancelRender', async (evt, id) => {
	try {
		return cancelRender(id)
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('cancelAllRenders', async () => {
	try {
		return cancelAllRenders()
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('clearTempFiles', async () => {
	try {
		return temp.clearAll()
	} catch (err) {
		console.error(err)
	}
})

ipcMain.on('requestPrefs', async evt => {
	try {
		evt.reply('prefsRecieved', await loadPrefs())
	} catch (err) {
		console.error(err)
		evt.reply('prefsErr', err)
	}
})

ipcMain.on('savePrefs', async (evt, prefs) => {
	try {
		await savePrefs(prefs)

		evt.reply('prefsSaved')
		mainWin.webContents.send('syncPrefs', prefs)
	} catch (err) {
		console.error(err)
		evt.reply('savePrefsErr', err)
	}
})

ipcMain.on('retryUpdate', () => {
	autoUpdater.checkForUpdatesAndNotify()
})

ipcMain.on('checkForUpdateBackup', async () => {
	const version = await checkForUpdate()

	if (version) {
		mainWin.close()
		createUpdateWindow()
	}
})
