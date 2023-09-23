import { ipcRenderer } from 'electron'

import { sendMessage } from './sendMessage'

export const requestPresets = (referencesOnly, presorted) => sendMessage({
	sendMsg: 'requestPresets',
	recieveMsg: 'presetsRecieved',
	errMsg: 'presetsErr',
	data: { referencesOnly, presorted }
})

export const getPresetAttributes = presetId => sendMessage({
	sendMsg: 'getPresetAttributes',
	recieveMsg: 'presetAttributesRetrieved',
	errMsg: 'retrievePresetAttributesErr',
	data: { presetId }
})

export const openPresetsSaveAs = preset => {
	ipcRenderer.send('openPresetSaveAs', { preset })
}

export const closePresetSaveAs = () => {
	ipcRenderer.send('closePresetSaveAs')
}

export const getPresetToSave = () => ipcRenderer.invoke('getPresetToSave')

export const savePreset = data => sendMessage({
	sendMsg: 'savePreset',
	recieveMsg: 'presetSaved',
	errMsg: 'savePresetErr',
	data
})

export const addPresetsSyncListener = callback => {
	ipcRenderer.on('syncPresets', (evt, newPrefs) => {
		callback(newPrefs)
	})
}

export const removePresetsSyncListener = () => {
	ipcRenderer.removeAllListeners('syncPresets')
}
