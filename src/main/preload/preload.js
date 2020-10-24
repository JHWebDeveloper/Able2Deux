import { shell, ipcRenderer, contextBridge } from 'electron'
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

interop.getVersion = () => ipcRenderer.invoke('getVersion')


// ---- ELECTRON METHODS --------

interop.bringToFront = () => {
	ipcRenderer.send('bringToFront')
}

interop.quit = () => {
	ipcRenderer.send('quit')
}

interop.revealInTempFolder = filePath => {
	shell.showItemInFolder(filePath)
}


// --- DIALOGS --------

interop.chooseDirectory = async () => {
	const { filePaths, canceled } = await ipcRenderer.invoke('showOpenDialog', {
		buttonLabel: 'Choose',
		properties: ['openDirectory', 'createDirectory']
	})

	return { filePaths, canceled }
}

interop.directoryNotFoundAlert = dir => ipcRenderer.invoke('showMessageBox', {
	type: 'warning',
	buttons: ['Continue', 'Abort'],
	message: 'Directory not found!',
	detail: `Unable to locate the directory "${dir}". This folder may have been deleted, removed or taken offline. Continue without saving to this directory?`,
	checkboxLabel: 'Remove from Save Locations'
})

interop.warning = ({ message, detail, hasCheckbox }) => ipcRenderer.invoke('showMessageBox', {
	type: 'warning',
	buttons: ['OK', 'Cancel'],
	message,
	detail,
	...hasCheckbox ? { checkboxLabel: 'Don\'t show this message again' } : {}
})


// ---- CONTEXT MENU --------

interop.setContextMenu = () => {
	const textElement = 'input[type="text"], input[type="number"]'
	
	window.addEventListener('contextmenu', e => {
		ipcRenderer.invoke('getContextMenu', {
			isTextElement: e.target.matches(textElement) && !e.target.disabled,
			x: e.x,
			y: e.y
		})
	})
}


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
