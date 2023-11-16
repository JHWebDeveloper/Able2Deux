import { ipcRenderer } from 'electron'

import { sendMessage } from './sendMessage'

export const requestWorkspace = () => sendMessage({
	sendMsg: 'requestWorkspace',
	recieveMsg: 'workspaceRecieved',
	errMsg: 'workspaceErr'
})

export const saveWorkspaceState = properties => {
	ipcRenderer.send('saveWorkspace', properties)
}

export const savePanelState = (panelName, properties) => {
	ipcRenderer.send('saveWorkspacePanel', { panelName, properties })
}
