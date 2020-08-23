import { remote, ipcRenderer } from 'electron'

import { sendMessage } from './sendMessage'

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

export const addPrefsSyncListener = callback => {
	ipcRenderer.on('syncPrefs', (evt, newPrefs) => {
		callback(newPrefs)
	})
}

export const removePrefsSyncListener = () => {
	ipcRenderer.removeAllListeners('syncPrefs')
}

export const enablePrefs = () => {
	remote.Menu
		.getApplicationMenu()
		.getMenuItemById('Preferences')
		.enabled = true
}

export const disablePrefs = () => {
	remote.Menu
		.getApplicationMenu()
		.getMenuItemById('Preferences')
		.enabled = false
}
