import { desktopCapturer, remote } from 'electron'
import { v1 as uuid } from 'uuid'

import { sendMessage } from './sendMessage'

export const getRecordSources = async () => {
	const sources = await desktopCapturer.getSources({
		types: ['window', 'screen'],
		thumbnailSize: {
			width: 256,
			height: 144
		}
	})

	return sources.map(src => ({
		...src,
		thumbnail: src.thumbnail.toDataURL()
	}))
}

let recorder = false
let timeout = false

const clearRecorder = () => {
	recorder = false
	clearTimeout(timeout)
}

const getStream = chromeMediaSourceId => navigator.mediaDevices.getUserMedia({
	audio: process.platform === 'darwin' ? false : {
		mandatory: {
			chromeMediaSource: 'desktop',
		}
	},
	video: {
		mandatory: {
			chromeMediaSource: 'desktop',
			chromeMediaSourceId,
			minFrameRate: 60,
			maxFrameRate: 60
		}
	}
})

const handleStream = (stream, timer, setRecordIndicator) => new Promise((resolve, reject) => {
	const blobs = []

	recorder = new MediaRecorder(stream)

	recorder.onstart = () => {
		setRecordIndicator(true)

		if (timer.enabled) {
			timeout = setTimeout(() => {
				recorder.stop()
				remote.getCurrentWindow().show()
			}, timer.tc * 1000)
		}
	}

	recorder.ondataavailable = e => {
		blobs.push(e.data)
	}

	recorder.onerror = err => {
		clearRecorder()
		reject(err)
	}

	recorder.onstop = () => {
		clearRecorder()
		setRecordIndicator(false)
		resolve(blobs)
	}

	requestAnimationFrame(() => {
		recorder.start()
	})
})

const getBuffer = blob => new Promise((resolve, reject) => {
	const fileReader = new FileReader()

	fileReader.onload = () => {
		const buffer = Buffer.alloc(fileReader.result.byteLength)
		const arr = new Uint8Array(fileReader.result)
	
		for (let i = 0, l = arr.byteLength; i < l; i++) {
			buffer[i] = arr[i]
		}

		resolve(buffer)
	}

	fileReader.onerror = reject
	fileReader.readAsArrayBuffer(blob)
})

export const startRecording = async ({ streamId, timer, setRecordIndicator, onStart, onComplete, onError }) => {
	const stream = await getStream(streamId)
	const blobs  = await handleStream(stream, timer, setRecordIndicator)
	const buffer = await getBuffer(new Blob(blobs, { type: 'video/mp4' }))

	const recordId = uuid()

	onStart(recordId)

	try {
		const mediaData = await saveScreenRecording(recordId, buffer)
		onComplete(recordId, mediaData)
	} catch (err) {
		onError(recordId)
	}
}

export const stopRecording = () => {
	recorder.stop()
}

const saveScreenRecording = (id, buffer) => sendMessage({
	sendMsg: 'saveScreenRecording',
	recieveMsg: `screenRecordingSaved_${id}`,
	errMsg: `screenRecordingSaveErr_${id}`,
	data: { id, buffer }
})