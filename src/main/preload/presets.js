import { sendMessage } from './sendMessage'

export const requestPresets = referencesOnly => sendMessage({
	sendMsg: 'requestPresets',
	recieveMsg: 'presetsRecieved',
	errMsg: 'presetsErr',
  data: { referencesOnly }
})
