import { ipcRenderer } from 'electron'
import { v1 as uuid } from 'uuid'

import { sendMessage, requestChannel } from './sendMessage'


// ---- SCREEN RECORDER --------

export * from './screenRecorder'


// ---- DOWNLOAD --------

export const getTitleFromURL = data => sendMessage({
	sendMsg: 'getTitleFromURL',
	recieveMsg: `titleRecieved_${data.id}`,
	errMsg: `titleErr_${data.id}`,
	data
})

export const requestDownloadChannel = ({ id, url, optimize, output, disableRateLimit, startCallback, progressCallback }) => (
	requestChannel({
		sendMsg: 'requestDownload',
		recieveMsg: `downloadComplete_${id}`,
		errMsg: `downloadErr_${id}`,
		data: { id, url, optimize, output, disableRateLimit },
		startMsg: `downloadStarted_${id}`,
		progressMsg: `downloadProgress_${id}`,
		startCallback,
		progressCallback
	})
)

export const cancelDownload = id => ipcRenderer.send('cancelDownload', id)


// ---- UPLOAD --------

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

export const removeMediaFile = id => ipcRenderer.send('removeMediaFile', id)
