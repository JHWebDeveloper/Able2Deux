import { ipcRenderer } from 'electron'

export const addUpdateListeners = ({ onStarted, onProgress, onError }) => {
	ipcRenderer.once('updateStarted', (evt, version) => {
		onStarted(version)
	})

	ipcRenderer.on('updateProgress', (evt, percent) => {
		onProgress(percent)
	})

	ipcRenderer.on('updateError', onError)
}

export const removeUpdateListeners = () => {
	ipcRenderer.removeAllListeners('updateStarted')
	ipcRenderer.removeAllListeners('updateProgress')
	ipcRenderer.removeAllListeners('updateError')
}

export const retryUpdate = () => ipcRenderer.send('retryUpdate')

export const checkForUpdateBackup = () => ipcRenderer.send('checkForUpdateBackup')
