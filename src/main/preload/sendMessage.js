import { ipcRenderer } from 'electron'

const sendMessage = ({ sendMsg, recieveMsg, errMsg, data }) => new Promise((resolve, reject) => {
	ipcRenderer.once(recieveMsg, (evt, res) => {
		ipcRenderer.removeAllListeners(errMsg)
		resolve(res)
	})

	ipcRenderer.once(errMsg, (evt, err) => {
		ipcRenderer.removeAllListeners(recieveMsg)
		reject(err)
	})

	ipcRenderer.send(sendMsg, data)
})

const requestChannel = msgData => {
	const {
		sendMsg,
		recieveMsg,
		errMsg,
		data,
		startMsg,
		startCallback,
		progressMsg,
		progressCallback
	} = msgData

	return new Promise((resolve, reject) => {
		ipcRenderer.once(startMsg, (evt, start) => {
			startCallback(start)
		})

		ipcRenderer.on(progressMsg, (evt, progress) => {
			progressCallback(progress)
		})

		ipcRenderer.once(recieveMsg, (evt, res) => {
			ipcRenderer.removeAllListeners(errMsg)
			ipcRenderer.removeAllListeners(progressMsg)
			resolve(res)
		})

		ipcRenderer.once(errMsg, (evt, err) => {
			ipcRenderer.removeAllListeners(recieveMsg)
			ipcRenderer.removeAllListeners(startMsg)
			ipcRenderer.removeAllListeners(progressMsg)
			reject(err)
		})

		ipcRenderer.send(sendMsg, data)
	})
}

export { sendMessage, requestChannel }
