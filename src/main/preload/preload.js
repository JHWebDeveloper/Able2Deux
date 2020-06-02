import { remote, shell, ipcRenderer, desktopCapturer } from 'electron'
import { v1 as uuid } from 'uuid'
import path from 'path'

import { sendMessage, requestChannel } from './sendMessage'
import setContextMenu from './contextMenu'

const interop = {}

interop.setContextMenu = setContextMenu

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

window.ABLE2 = Object.freeze({
	interop: Object.freeze(interop)
})
