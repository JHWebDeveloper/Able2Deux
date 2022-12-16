import { ipcRenderer, shell } from 'electron'
import { v1 as uuid } from 'uuid'
import log from 'electron-log'
import ysFixWebmDuration from 'fix-webm-duration'

import { sendMessage } from './sendMessage'

const logError = (() => {
	if (process.env.NODE_ENV === 'production') {
		log.catchErrors({ showDialog: false })
		return log.error
	} else {
		return console.error
	}
})()

const saveScreenRecording = (id, buffer, fps, screenshot) => sendMessage({
	sendMsg: 'saveScreenRecording',
	recieveMsg: `screenRecordingSaved_${id}`,
	errMsg: `saveScreenRecordingErr_${id}`,
	data: { id, buffer, fps, screenshot }
})

export const getRecordSources = () => sendMessage({
	sendMsg: 'requestRecordSources',
	recieveMsg: 'recordSourcesFound',
	errMsg: 'requestRecordSourcesErr'
})

export const findBlackHole = async () => {
	const devices = await navigator.mediaDevices.enumerateDevices()

	if (!devices.length) return false

	// eslint-disable-next-line no-extra-parens
	const blackHole = devices.filter(device => (
		device.kind === 'audiooutput' &&
		device.label === 'BlackHole 2ch (Virtual)' &&
		device.deviceId !== 'default'
	))

	return blackHole?.[0]?.deviceId
}

export const getBlackHole = () => {
	shell.openExternal('https://existential.audio/blackhole/')
}

const mac = process.platform === 'darwin'

const getStream = async (chromeMediaSourceId, frameRate, noAudio) => {
	const videoStream = await navigator.mediaDevices.getUserMedia({
		audio: !noAudio && !mac && {
			mandatory: {
				chromeMediaSource: 'desktop'
			}
		},
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId,
				minFrameRate: frameRate,
				maxFrameRate: frameRate
			}
		}
	})

	if (!mac) return videoStream

	const deviceId = await findBlackHole()

	if (!deviceId) return videoStream 

	const audioStream = await navigator.mediaDevices.getUserMedia({
		audio: {
			deviceId: {
				exact: deviceId
			}
		}
	})

	const audioTracks = audioStream.getAudioTracks()

	if (audioTracks.length > 0) videoStream.addTrack(audioTracks[0])

	return videoStream
}

const type = 'video/webm; codecs="vp9, opus"'
let recorder = false
let startTime = false
let timeout = false
let duration = 0

const clearRecorder = () => {
	recorder = false
	clearTimeout(timeout)
	ipcRenderer.send('enableSleep')
}

const recordStream = (stream, timer, setRecordIndicator) => new Promise((resolve, reject) => {
	const chunks = []

	recorder = new MediaRecorder(stream, { mediaType: type })

	recorder.onstart = () => {
		startTime = Date.now()

		setRecordIndicator(true)

		if (timer) {
			timeout = setTimeout(() => {
				recorder.stop()
				ipcRenderer.send('bringToFront')
			}, timer * 1000)
		}
	}

	recorder.ondataavailable = e => {
		chunks.push(e.data)
	}

	recorder.onerror = err => {
		clearRecorder()
		setRecordIndicator(false)
		reject(err)
	}

	recorder.onstop = () => {
		duration = Date.now() - startTime

		clearRecorder()
		setRecordIndicator(false)
		resolve(chunks)
	}

	requestAnimationFrame(() => {
		ipcRenderer.send('disableSleep')
		recorder.start()
	})
})

const getArrayBuffer = chunks => new Promise((resolve, reject) => {
	const blob = new Blob(chunks, { type })
	const fileReader = new FileReader()

	fileReader.onloadend = () => resolve(fileReader.result)
	fileReader.onerror = reject

	ysFixWebmDuration(blob, duration, fixedBlob => {
		fileReader.readAsArrayBuffer(fixedBlob)
	})
})

export const startRecording = async ({ streamId, frameRate, timer, setRecordIndicator, onStart, onComplete, onError }) => {
	try {
		const stream = await getStream(streamId, frameRate)
		const chunks = await recordStream(stream, timer, setRecordIndicator)
		const arrBuf = await getArrayBuffer(chunks)
		const buffer = Buffer.from(arrBuf)
		const recordId = uuid()
	
		onStart(recordId)
	
		try {
			const mediaData = await saveScreenRecording(recordId, buffer, frameRate)
			onComplete(recordId, mediaData)
		} catch (err) {
			onError(err, recordId)
		}
	} catch (err) {
		logError(err)
		onError(new Error('An error occurred during the screen record.'))
	}
}

export const stopRecording = () => {
	recorder.stop()
}

export const captureScreenshot = ({ streamId, frameRate, onCapture, onError }) => {
	const video = document.createElement('video')

	video.onloadeddata = async () => {
		video.style.width = `${video.videoWidth}px`
		video.style.height = `${video.videoHeight}px`

		video.play()

		const cnv = document.createElement('canvas')
		const ctx = cnv.getContext('2d')

		cnv.width = video.videoWidth
		cnv.height = video.videoHeight
		
		ctx.drawImage(video, 0, 0, cnv.width, cnv.height)

		const buffer = cnv.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '')
		const recordId = uuid()

		try {
			const mediaData = await saveScreenRecording(recordId, buffer, frameRate, true)
			onCapture(recordId, mediaData)
		} catch (err) {
			onError(err, recordId)
		} finally {
			video.remove()
			ipcRenderer.send('bringToFront')
		}
	}

	ipcRenderer.send('hide')

	setTimeout(async () => {
		try {
			video.srcObject = await getStream(streamId, frameRate, true)
		} catch (err) {
			logError(err)
			onError(new Error('An error occurred while capturing the screenshot.'))
		}
	
		document.body.appendChild(video)
	}, 360)
}
