import { desktopCapturer, remote, shell } from 'electron'
import { v1 as uuid } from 'uuid'

import { sendMessage } from './sendMessage'

const saveScreenRecording = (id, buffer, screenshot) => sendMessage({
	sendMsg: 'saveScreenRecording',
	recieveMsg: `screenRecordingSaved_${id}`,
	errMsg: `screenRecordingSaveErr_${id}`,
	data: { id, buffer, screenshot }
})

const prod = process.env.NODE_ENV === 'production'
const mac  = process.platform === 'darwin'

export const getRecordSources = async () => {
	const sources = await desktopCapturer.getSources({
		types: ['window', 'screen'],
		thumbnailSize: {
			width: 256,
			height: 144
		}
	})

	if (prod && mac && remote.systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
		return []
	}

	return sources.map(src => ({
		...src,
		thumbnail: src.thumbnail.toDataURL()
	}))
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

const type = 'video/webm; codecs="vp9, opus"'
let recorder = false
let timeout = false
let blockId = false

const clearRecorder = () => {
	recorder = false
	clearTimeout(timeout)
	remote.powerSaveBlocker.stop(blockId)
}

const recordStream = (stream, timer, setRecordIndicator) => new Promise((resolve, reject) => {
	const chunks = []

	recorder = new MediaRecorder(stream, { mediaType: type })

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
		chunks.push(e.data)
	}

	recorder.onerror = err => {
		clearRecorder()
		setRecordIndicator(false)
		reject(err)
	}

	recorder.onstop = () => {
		clearRecorder()
		setRecordIndicator(false)
		console.time()
		resolve(chunks)
	}

	requestAnimationFrame(() => {
		blockId = remote.powerSaveBlocker.start('prevent-display-sleep')
		recorder.start()
	})
})

const getArrayBuffer = chunks => new Promise((resolve, reject) => {
	const blob = new Blob(chunks, { type })
	const fileReader = new FileReader()

	fileReader.onloadend = () => resolve(fileReader.result)

	fileReader.onerror = reject
	fileReader.readAsArrayBuffer(blob)
})

export const startRecording = async ({ streamId, timer, setRecordIndicator, onStart, onComplete, onSaveError }) => {
	const stream = await getStream(streamId)
	const chunks = await recordStream(stream, timer, setRecordIndicator)
	const arrBuf = await getArrayBuffer(chunks)
	const buffer = Buffer.from(arrBuf)
	const recordId = uuid()

	onStart(recordId)

	try {
		const mediaData = await saveScreenRecording(recordId, buffer)
		console.timeEnd()
		onComplete(recordId, mediaData)
	} catch (err) {
		onSaveError(recordId)
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
