import electron, { ipcMain } from 'electron'
import url from 'url'
import path from 'path'

import { initExtDirectories, temp } from './modules/utilities/extFileHandlers'
import { getTitleFromURL, downloadVideo, cancelDownload } from './modules/aquisition/download'
import { checkFileType, upload } from './modules/aquisition/upload'
import { saveScreenRecording } from './modules/aquisition/saveScreenRecording'
import { getMediaInfo } from './modules/aquisition/mediaInfo'
import previewStill from './modules/preview/preview'
import updatePreviewSourceImage from './modules/preview/updatePreviewSourceImage'
import { loadPrefs, savePrefs } from './modules/preferences/preferences'

const dev = process.env.NODE_ENV === 'development'
const mac = process.platform === 'darwin'
let win = false
let preferences = false

const { app, BrowserWindow, Menu } = electron

const openWindow = prefs => new BrowserWindow({
	...prefs,
	show: false,
	backgroundColor: '#eee',
	webPreferences: {
		nodeIntegration: dev,
		enableEval: false,
		preload: dev
			? path.join(__dirname, 'preload', 'babelRegister.js')
			: path.join(__dirname, 'preload.js')
	}
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

const createWindow = () => {
	initExtDirectories()

	win = openWindow({
		width: 952,
		height: 780
	})

	win.loadURL(createURL('index'))

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

	Menu.setApplicationMenu(mainMenu)

	win.on('ready-to-show', () => {
		win.show()
		if (dev) win.webContents.openDevTools()
	})

	win.on('close', () => {
		win = false
	})
}

const lock = app.requestSingleInstanceLock()

if (!lock) {
	app.quit()
} else {
	app.on('second-instance', () => {
		if (win) {
			if (win.isMinimized()) win.restore()
			win.focus()
		}
	})

	app.on('ready', () => {
		createWindow()
	})
}

app.on('window-all-closed', () => {
	if (!mac) app.quit()
})

app.on('activate', () => {
	if (!win) createWindow()
})


// ---- MENU CONFIG --------

const prefsMenuItem = [
	{ type: 'separator' },
	{
		label: 'Preferences',
		accelerator: 'CmdOrCtrl+,',
		click() {
			preferences = openWindow({
				parent: win,
				width: 700,
				height: 400,
				minimizable: false,
				maximizable: false
			})

			preferences.loadURL(createURL('preferences'))

			preferences.once('ready-to-show', () => {
				preferences.show()
			})

			preferences.on('close', () => {
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
			...(mac ?  [] : prefsMenuItem)
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
		evt.reply(`titleErr_${id}`, err)
	}
})

ipcMain.on('requestDownload', async (evt, data) => {
	const { id } = data

	try {
		const tempFilePath = await downloadVideo(data, win)
		const mediaData = await getMediaInfo(id, 'video', tempFilePath)

		evt.reply(`downloadComplete_${id}`, mediaData)
	} catch (err) {
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

ipcMain.on('requestPreviewStill', async (evt, exportData) => {
	try {
		const dataURL = await previewStill(exportData)

		evt.reply('previewStillCreated', dataURL)
	} catch (err) {
		if (err.toString() !== 'Error: ffmpeg was killed with signal SIGKILL') {
			console.error(err)
		}
	}
})

ipcMain.on('requestPrefs', async evt => {
	try {
		evt.reply('prefsRecieved', await loadPrefs())
	} catch (err) {
		evt.reply('prefsErr', err)
	}
})

ipcMain.on('savePrefs', async (evt, prefs) => {
	try {
		await savePrefs(prefs)

		evt.reply('prefsSaved')
		win.webContents.send('syncPrefs', prefs)
	} catch (err) {
		evt.reply('savePrefsErr', err)
	}
})
