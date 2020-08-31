import { remote, shell, ipcRenderer, contextBridge } from 'electron'
import path from 'path'

import * as setContextMenu from './contextMenu'
import * as acquisition from './acquisition'
import * as formatting from './formatting'
import * as preferences from './preferences'
import * as update from './update'

const interop = {}

Object.assign(interop, setContextMenu, acquisition, formatting, preferences, update)


// ---- GET INFO --------

interop.getFileName = file => path.parse(file).name

interop.isMac = process.platform === 'darwin'

interop.version = remote.app.getVersion()


// ---- ELECTRON METHODS --------

interop.bringToFront = () => {
	remote.getCurrentWindow().show()
}

interop.closeCurrentWindow = () => {
	remote.getCurrentWindow().close()
}

interop.quit = () => {
	remote.app.exit(0)
}

interop.revealInTempFolder = filePath => {
	shell.showItemInFolder(filePath)
}


// --- DIALOGS --------

interop.chooseDirectory = async () => {
	const { filePaths, canceled } = await remote.dialog.showOpenDialog({
		buttonLabel: 'Choose',
		properties: ['openDirectory', 'createDirectory']
	})

	return { filePaths, canceled }
}

interop.directoryNotFoundAlert = async dir => {
	const alert = await remote.dialog.showMessageBox({
		type: 'warning',
		buttons: ['Continue', 'Abort'],
		message: 'Directory not found!',
		detail: `Unable to locate the directory "${dir}". This folder may have been deleted, removed or taken offline. Continue without saving to this directory?`
	})
	
	return alert.response === 1
}

interop.warning = async ({ message, detail }) => (await remote.dialog.showMessageBox({
	type: 'warning',
	buttons: ['OK', 'Cancel'],
	message,
	detail
})).response


// ---- GLOBAL METHODS --------

interop.checkIfDirectoryExists = async dir =>  ipcRenderer.invoke('checkDirectoryExists', dir)

interop.clearTempFiles = () => ipcRenderer.send('clearTempFiles')


// ---- ATTACH ALL TO RENDERER--------

if (process.env.NODE_ENV === 'development') {
	window.ABLE2 = Object.freeze({
		interop: Object.freeze(interop)
	})
} else {
	contextBridge.exposeInMainWorld('ABLE2', { interop })
}
