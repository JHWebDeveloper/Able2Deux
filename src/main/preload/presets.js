import { ipcRenderer } from 'electron'

import { sendMessage } from './sendMessage'

export const closePresetSaveAs = () => {
	ipcRenderer.send('closePresetSaveAs')
}

export const closePresets = () => {
	ipcRenderer.send('closePresets')
}

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

export const openPresetSaveAs = preset => {
	ipcRenderer.send('openPresetSaveAs', { preset })
}

export const getPresetToSave = () => ipcRenderer.invoke('getPresetToSave')

export const savePreset = (preset, saveType) => sendMessage({
	sendMsg: 'savePreset',
	recieveMsg: 'presetSaved',
	errMsg: 'savePresetErr',
	data: { preset, saveType }
})

export const openPresets = () => {
	ipcRenderer.send('openPresets')
}

export const savePresets = data => sendMessage({
	sendMsg: 'savePresets',
	recieveMsg: 'presetsSaved',
	errMsg: 'savePresetsErr',
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
