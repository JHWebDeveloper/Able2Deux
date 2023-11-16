import { ipcRenderer } from 'electron'
import { v1 as uuid } from 'uuid'

import { sendMessage, requestChannel } from './sendMessage'


// ---- SCREEN RECORDER --------

export * from './screenRecorder'


// ---- DOWNLOAD --------

export const getURLInfo = data => sendMessage({
	sendMsg: 'getURLInfo',
	recieveMsg: `URLInfoRecieved_${data.id}`,
	errMsg: `URLInfoErr_${data.id}`,
	data
})

export const requestDownloadChannel = params => {
	const { data, startCallback, progressCallback } = params
	
	return requestChannel({
		sendMsg: 'requestDownload',
		recieveMsg: `downloadComplete_${data.id}`,
		errMsg: `downloadErr_${data.id}`,
		startMsg: `downloadStarted_${data.id}`,
		progressMsg: `downloadProgress_${data.id}`,
		data,
		startCallback,
		progressCallback
	})
}

export const cancelDownload = id => {
	ipcRenderer.send('cancelDownload', id)
}

export const stopLiveDownload = id => {
	ipcRenderer.send('stopLiveDownload', id)
}


// ---- UPLOAD --------

export const openFiles = () => ipcRenderer.invoke('openFiles')

export const checkFileType = file => {
	const tempID = uuid()

	return sendMessage({
		sendMsg: 'checkFileType',
		recieveMsg: `fileTypeFound_${tempID}`,
		errMsg: `fileTypeErr_${tempID}`,
		data: { id: tempID, file }
	})
}

export const requestUpload = data => sendMessage({
	sendMsg: 'requestUpload',
	recieveMsg: `uploadComplete_${data.id}`,
	errMsg: `uploadErr_${data.id}`,
	data: data
})

export const setOpenWithListener = callback => {
	ipcRenderer.on('openWith', (evt, files) => {
		callback({ files })
	})
}

export const removeOpenWithListener = () => {
	ipcRenderer.removeAllListeners('openWith')
}
