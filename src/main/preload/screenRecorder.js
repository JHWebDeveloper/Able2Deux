import { desktopCapturer, remote, shell } from 'electron'
import { v1 as uuid } from 'uuid'
import { Decoder, Reader, tools } from 'ts-ebml'

import { sendMessage } from './sendMessage'

const saveScreenRecording = (id, buffer, screenshot) => sendMessage({
	sendMsg: 'saveScreenRecording',
	recieveMsg: `screenRecordingSaved_${id}`,
	errMsg: `screenRecordingSaveErr_${id}`,
	data: { id, buffer, screenshot }
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

export const findSoundflower = async () => {
	const devices = await navigator.mediaDevices.enumerateDevices()

	return devices.filter(device => (
		device.kind === 'audiooutput' &&
		device.label === 'Soundflower (2ch)' &&
		device.deviceId !== 'default'
	))[0]
}

export const getSoundflower = () => (
	shell.openExternal('https://github.com/mattingalls/Soundflower/releases/tag/2.0b2')
)

const getStream = async (chromeMediaSourceId, noAudio) => {
	const mac = process.platform === 'darwin'

	let videoStream = await navigator.mediaDevices.getUserMedia({
		audio: noAudio || mac ? false : {
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

	if (mac) {
		const { deviceId } = await findSoundflower()

		const audioStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				deviceId: {
					exact: deviceId
				}
			}
		})

		const audioTracks = audioStream.getAudioTracks()

		if (audioTracks.length > 0) videoStream.addTrack(audioTracks[0])
	}

	return videoStream
}

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

export const captureScreenshot = ({ streamId, onCapture, onError }) => {
	const mainWin = remote.getCurrentWindow()
	const video = document.createElement('video')

	video.onloadeddata = async () => {
		video.style.width  = `${video.videoWidth}px`
		video.style.height = `${video.videoHeight}px`

		video.play()

		const cnv = document.createElement('canvas')
		const ctx = cnv.getContext('2d')

		cnv.width  = video.videoWidth
		cnv.height = video.videoHeight
		
		ctx.drawImage(video, 0, 0, cnv.width, cnv.height)

		const buffer = cnv.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '')
		const recordId = uuid()

		try {
			const mediaData = await saveScreenRecording(recordId, buffer, true)
			onCapture(recordId, mediaData)
		} catch (err) {
			onError(recordId)
		} finally {
			video.remove()
			mainWin.show()
		}
	}

	mainWin.hide()

	setTimeout(async () => {
		video.srcObject = await getStream(streamId, true)
	
		document.body.appendChild(video)
	}, 500)
}
