import { remote, shell, ipcRenderer, contextBridge } from 'electron'
import path from 'path'

import * as setContextMenu from './contextMenu'
import * as acquisition from './acquisition'
import * as formatting from './formatting'
import * as preferences from './preferences'
import * as update from './update'

const interop = Object.assign({}, setContextMenu, acquisition, formatting, preferences, update)


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

interop.directoryNotFoundAlert = async dir => remote.dialog.showMessageBox({
	type: 'warning',
	buttons: ['Continue', 'Abort'],
	message: 'Directory not found!',
	detail: `Unable to locate the directory "${dir}". This folder may have been deleted, removed or taken offline. Continue without saving to this directory?`,
	checkboxLabel: 'Delete this directory'
})

interop.warning = async ({ message, detail, hasCheckbox }) => await remote.dialog.showMessageBox({
	type: 'warning',
	buttons: ['OK', 'Cancel'],
	message,
	detail,
	...hasCheckbox ? { checkboxLabel: 'Don\'t show this message again' } : {}
})


// ---- GLOBAL METHODS --------

interop.checkIfDirectoryExists = async dir => ipcRenderer.invoke('checkDirectoryExists', dir)

interop.clearTempFiles = () => ipcRenderer.send('clearTempFiles')


// ---- ATTACH ALL TO RENDERER --------

const nameSpace = 'ABLE2'

const freeze = Object.freeze({
	interop: Object.freeze(interop)
})

if (process.env.NODE_ENV === 'development') {
	window[nameSpace] = freeze
} else {
	contextBridge.exposeInMainWorld(nameSpace, freeze)
}
