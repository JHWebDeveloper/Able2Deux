import { ipcRenderer } from 'electron'

import { sendMessage, requestChannel } from './sendMessage'

export const openRenderQueue = data => sendMessage({
	sendMsg: 'openRenderQueue',
	recieveMsg: 'renderQueueOpened',
	errMsg: 'openRenderQueue',
	data
})

export const getMediaToRender = () => ipcRenderer.invoke('getMediaToRender')

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

export const closeRenderQueue = startOver => ipcRenderer.send('closeRenderQueue', startOver)

export const setStartOverListener = callback => {
	ipcRenderer.on('startOver', (evt, { clearUndos } = {}) => {
		callback(clearUndos)
	})
}

export const removeStartOverListener = () => {
	ipcRenderer.removeAllListeners('startOver')
}
