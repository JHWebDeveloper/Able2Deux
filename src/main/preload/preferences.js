import { ipcRenderer } from 'electron'

import { sendMessage } from './sendMessage'

export const closePreferences = () => {
	ipcRenderer.send('closePrefs')
}

export const requestPrefs = () => sendMessage({
	sendMsg: 'requestPrefs',
	recieveMsg: 'prefsRecieved',
	errMsg: 'prefsErr'
})

export const savePrefs = prefs => sendMessage({
	sendMsg: 'savePrefs',
	recieveMsg: 'prefsSaved',
	errMsg: 'savePrefsErr',
	data: prefs
})

export const requestDefaultPrefs = () => ipcRenderer.invoke('requestDefaultPrefs')

export const addPrefsSyncListener = callback => {
	ipcRenderer.on('syncPrefs', (evt, newPrefs) => {
		callback(newPrefs)
	})
}

export const removePrefsSyncListener = () => {
	ipcRenderer.removeAllListeners('syncPrefs')
}

export const clearScratchDisks = () => sendMessage({
	sendMsg: 'clearScratchDisks',
	recieveMsg: 'scratchDisksCleared',
	errMsg: 'clearScratchDisksErr'
})
