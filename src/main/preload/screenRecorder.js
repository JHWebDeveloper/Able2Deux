import { desktopCapturer, remote } from 'electron'
import { v1 as uuid } from 'uuid'
import { Decoder, Reader, tools } from 'ts-ebml'

import { sendMessage } from './sendMessage'

const saveScreenRecording = (id, buffer) => sendMessage({
	sendMsg: 'saveScreenRecording',
	recieveMsg: `screenRecordingSaved_${id}`,
	errMsg: `screenRecordingSaveErr_${id}`,
	data: { id, buffer }
})

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
			chromeMediaSource: 'desktop'
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

const recordStream = (stream, timer, setRecordIndicator) => new Promise((resolve, reject) => {
	const blobs = []

	recorder = new MediaRecorder(stream, { mediaType: 'video/webm' })

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

const getArrayBuffer = blob => new Promise((resolve, reject) => {
	const fileReader = new FileReader()

	fileReader.onloadend = () => resolve(fileReader.result)

	fileReader.onerror = reject
	fileReader.readAsArrayBuffer(blob)
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

const fixDuration = async blobs => {
	const blob = new Blob(blobs, { type: 'video/webm' })
	const decoder = new Decoder()
	const reader = new Reader()

	reader.logging = false
	reader.drop_default_duration = false

	const buffer = await getArrayBuffer(blob)

	const elms = decoder.decode(buffer)

	elms.forEach((elm) => reader.read(elm))

	reader.stop()

	const metadata = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues)
	const body = buffer.slice(reader.metadataSize)
	const fixedBlob = new Blob([metadata, body], { type: 'video/webm' })

	return getBuffer(fixedBlob)
}

export const startRecording = async ({ streamId, timer, setRecordIndicator, onStart, onComplete, onError }) => {
	const stream = await getStream(streamId)
	const blobs  = await recordStream(stream, timer, setRecordIndicator)
	const buffer = await fixDuration(blobs)

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
