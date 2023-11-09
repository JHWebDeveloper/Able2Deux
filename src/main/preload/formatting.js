import { ipcRenderer } from 'electron'

import { sendMessage } from './sendMessage'

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
