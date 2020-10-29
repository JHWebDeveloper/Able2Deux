import { ipcRenderer } from 'electron'

import { requestChannel, sendMessage } from './sendMessage'

// ---- PREVIEW --------

export const initPreview = async data => ipcRenderer.invoke('initPreview', data)

export const requestPreviewStill = async data => ipcRenderer.send('requestPreviewStill', data)

export const setPreviewListeners = callback => {
	ipcRenderer.on('previewStillCreated', (evt, still) => {
		callback(still)
	})
}

export const removePreviewListeners = () => {
	ipcRenderer.removeAllListeners('previewStillCreated')
}

export const copyPreviewToImports = data => sendMessage({
	sendMsg: 'copyPreviewToImports',
	recieveMsg: 'previewCopied',
	errMsg: 'previewCopiedFailed',
	data
})


// ---- RENDER --------

export const requestRenderChannel = params => {
	const { data, startCallback, progressCallback } = params
	
	return requestChannel({
		sendMsg: 'requestRender',
		recieveMsg: `renderComplete_${data.id}`,
		errMsg: `renderFailed_${data.id}`,
		data,
		startMsg: `renderStarted_${data.id}`,
		progressMsg: `renderProgress_${data.id}`,
		startCallback,
		progressCallback
	})
}

export const cancelRender = id => ipcRenderer.send('cancelRender', id)
