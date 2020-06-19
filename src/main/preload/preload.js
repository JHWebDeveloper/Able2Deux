import { remote, shell, ipcRenderer, desktopCapturer, contextBridge } from 'electron'
import { v1 as uuid } from 'uuid'
import path from 'path'

import { sendMessage, requestChannel } from './sendMessage'
import setContextMenu from './contextMenu'

const interop = {}

interop.setContextMenu = setContextMenu

interop.version = remote.app.getVersion()

interop.isMac = process.platform === 'darwin'

interop.getFileName = file => path.parse(file).name

interop.warning = async ({ message, detail }) => (await remote.dialog.showMessageBox({
	type: 'warning',
	buttons: ['OK', 'Cancel'],
	message,
	detail
})).response

interop.getTitleFromURL = data => sendMessage({
	sendMsg: 'getTitleFromURL',
	recieveMsg: `titleRecieved_${data.id}`,
	errMsg: `titleErr_${data.id}`,
	data
})

interop.requestDownloadChannel = ({ id, url, optimize, output, startCallback, progressCallback }) => (
	requestChannel({
		sendMsg: 'requestDownload',
		recieveMsg: `downloadComplete_${id}`,
		errMsg: `downloadErr_${id}`,
		data: { id, url, optimize, output },
		startMsg: `downloadStarted_${id}`,
		progressMsg: `downloadProgress_${id}`,
		startCallback,
		progressCallback
	})
)

interop.cancelDownload = id => ipcRenderer.send('cancelDownload', id)

interop.checkFileType = file => {
	const tempID = uuid()

	return sendMessage({
		sendMsg: 'checkFileType',
		recieveMsg: `fileTypeFound_${tempID}`,
		errMsg: `fileTypeErr_${tempID}`,
		data: { id: tempID, file }
	})
}

interop.requestUpload = data => sendMessage({
	sendMsg: 'requestUpload',
	recieveMsg: `uploadComplete_${data.id}`,
	errMsg: `uploadErr_${data.id}`,
	data: data
})

interop.removeMediaFile = id => ipcRenderer.send('removeMediaFile', id)

interop.bringToFront = () => {
	remote.getCurrentWindow().show()
}

interop.getRecordSources = () => desktopCapturer.getSources({
	types: ['window', 'screen'],
	thumbnailSize: {
		width: 256,
		height: 144
	}
})

interop.saveScreenRecording = (id, buffer) => sendMessage({
	sendMsg: 'saveScreenRecording',
	recieveMsg: `screenRecordingSaved_${id}`,
	errMsg: `screenRecordingSaveErr_${id}`,
	data: { id, buffer }
})

interop.initPreview = async data => ipcRenderer.invoke('initPreview', data)

interop.requestPreviewStill = async data => ipcRenderer.send('requestPreviewStill', data)

interop.setPreviewListeners = callback => {
	ipcRenderer.on('previewStillCreated', (evt, still) => {
		callback(still)
	})
}

interop.revealInTempFolder = filePath => {
	shell.showItemInFolder(filePath)
}

interop.removePreviewListeners = () => {
	ipcRenderer.removeAllListeners('previewStillCreated')
}

interop.requestPrefs = () => sendMessage({
	sendMsg: 'requestPrefs',
	recieveMsg: 'prefsRecieved',
	errMsg: 'prefsErr'
})

interop.savePrefs = prefs => sendMessage({
	sendMsg: 'savePrefs',
	recieveMsg: 'prefsSaved',
	errMsg: 'savePrefsErr',
	data: prefs
})

interop.addPrefsSyncListener = callback => {
	ipcRenderer.on('syncPrefs', (evt, newPrefs) => {
		callback(newPrefs)
	})
}

interop.removePrefsSyncListener = () => {
	ipcRenderer.removeAllListeners('syncPrefs')
}

interop.chooseDirectory = async () => {
	const { filePaths, canceled } = await remote.dialog.showOpenDialog({
		buttonLabel: 'Choose',
		properties: ['openDirectory', 'createDirectory']
	})

	return { filePaths, canceled }
}

interop.closeCurrentWindow = () => {
	remote.getCurrentWindow().close()
}

interop.checkIfDirectoryExists = async dir =>  ipcRenderer.invoke('checkDirectoryExists', dir)

interop.directoryNotFoundAlert = async dir => {
	const alert = await remote.dialog.showMessageBox({
		type: 'warning',
		buttons: ['Continue', 'Abort'],
		message: 'Directory not found!',
		detail: `Unable to locate the directory "${dir}". This folder may have been deleted, removed or taken offline. Continue without saving to this directory?`
	})
	
	return alert.response === 1
}

interop.requestRenderChannel = ({ data, startCallback, progressCallback }) => (
	requestChannel({
		sendMsg: 'requestRender',
		recieveMsg: `renderComplete_${data.id}`,
		errMsg: `renderFailed_${data.id}`,
		data,
		startMsg: `renderStarted_${data.id}`,
		progressMsg: `renderProgress_${data.id}`,
		startCallback,
		progressCallback
	})
)

interop.cancelRender = id => ipcRenderer.send('cancelRender', id)

interop.cancelAllRenders = () => ipcRenderer.send('cancelAllRenders')

interop.clearTempFiles = () => ipcRenderer.send('clearTempFiles')

interop.addUpdateListeners = ({ onStarted, onProgress, onError }) => {
	ipcRenderer.once('updateStarted', (evt, version) => {
		onStarted(version)
	})

	ipcRenderer.on('updateProgress', (evt, percent) => {
		onProgress(percent)
	})

	ipcRenderer.on('updateError', onError)
}

interop.removeUpdateListeners = () => {
	ipcRenderer.removeAllListeners('updateStarted')
	ipcRenderer.removeAllListeners('updateProgress')
}

interop.retryUpdate = () => ipcRenderer.send('retryUpdate')

interop.checkForUpdateBackup = () => ipcRenderer.send('checkForUpdateBackup')

interop.quit = () => remote.app.exit(0)

if (process.env.NODE_ENV === 'development') {
	window.ABLE2 = Object.freeze({
		interop: Object.freeze(interop)
	})
} else {
	contextBridge.exposeInMainWorld('ABLE2', { interop })
}
