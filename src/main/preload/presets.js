import { sendMessage } from './sendMessage'

export const requestPresets = referencesOnly => sendMessage({
	sendMsg: 'requestPresets',
	recieveMsg: 'presetsRecieved',
	errMsg: 'presetsErr',
  data: { referencesOnly }
})

export const getPresets = presetIds => sendMessage({
	sendMsg: 'getPresets',
	recieveMsg: 'presetsRetrieved',
	errMsg: 'retrievePresetsErr',
  data: { presetIds }
})
