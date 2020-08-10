import { promises as fsp } from 'fs'
import path from 'path'

import ffmpeg from '../utilities/ffmpeg'
import placeholder from '../utilities/placeholder'
import supportedImageCodecs from '../utilities/supportedImageCodecs'
import { temp } from '../utilities/extFileHandlers'

const round = (n, dec = 2) => Number(`${Math.round(`${n}e${dec}`)}e-${dec}`)

const base64Encode = async file => {
	if (!file) return placeholder

	try {
		return `data:image/png;base64,${await fsp.readFile(file, 'base64')}`
	} catch (err) {
		return placeholder
	}
}

const createScreenshot = (id, tempFilePath) => new Promise(resolve => {
	const screenshot = `${id}.thumbnail.jpg`

	ffmpeg(tempFilePath).on('end', () => {
		resolve(path.join(temp.imports.path, screenshot))
	}).on('error', () => {
		resolve(false) // ignore error for thumbnails
	}).screenshots({
		timemarks: ['50%'],
		folder: temp.imports.path,
		filename: screenshot,
		size: '384x?'
	})
})

const createPNGCopy = (id, tempFilePath, mediaType) => new Promise(resolve => {
	const png = path.join(temp.imports.path, `${id}.thumbnail.png`)
	const opt = []

	if (mediaType === 'gif') opt.push('-frames 1')

	ffmpeg(tempFilePath)
		.outputOption(opt)
		.output(png)
		.size('384x?')
		.on('error', () => resolve(false))
		.on('end', () => resolve(png))
		.run()
})

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)

const calculateAspectRatio = (a, b) => {
	const _gcd = gcd(a, b)

	return `${a / _gcd}:${b / _gcd}`
}

const getMediaKind = (codec, ext) => {
	if (/^gif|apng$/i.test(codec) || /^mjpegb?$/i.test(codec) && /^mjpe?g$/i.test(ext)) {
		return 'gif'
	} else if (supportedImageCodecs.includes(codec)) {
		return 'image'
	} else {
		return 'video'
	}
}

const getMetadata = file => new Promise((resolve, reject) => {
	ffmpeg.ffprobe(file, (err, metadata) => {
		if (err) {
			reject(err)
		} else {
			resolve(metadata)
		}
	})
})

const getSupportedCodecList = () => new Promise((resolve, reject) => {
	ffmpeg.getAvailableCodecs((err, codecs) => {
		if (err) {
			reject(err)
		} else {
			resolve(codecs)
		}
	})
})

export const checkFileType = async (file, preGeneratedMetadata) => {
	const [ metadata, codecs ] = await Promise.all([
		preGeneratedMetadata || getMetadata(file),
		getSupportedCodecList()
	])

	if (!metadata.streams || metadata.streams.length === 0) {
		throw new Error('Unsupported file type')
	}

	const video = {}
	const audio = {}

	video.stream = metadata.streams.find(stream => stream.codec_type === 'video')
	audio.stream = metadata.streams.find(stream => stream.codec_type === 'audio')

	if (video.stream) {
		video.codec = codecs[video.stream.codec_name]
		video.supported = video.codec && video.codec.canDecode
	}

	if (audio.stream) {
		audio.codec = codecs[audio.stream.codec_name]
		audio.supported = audio.codec && audio.codec.canDecode
	}
	
	if (
		audio.supported && !video.stream || // audio only
		audio.supported && supportedImageCodecs.includes(video.stream.codec_name) // audio with album artwork
	) {
		return 'audio'
	} else if (
		video.supported && audio.supported || // video with audio
		video.supported && !audio.stream // video only
	) {
		return getMediaKind(video.stream.codec_name, path.extname(file))
	} else {
		throw new Error('Unsupported file type')
	}
}

export const getMediaInfo = async (id, tempFilePath, mediaType, forcedFPS) => {
	const metadata = await getMetadata(tempFilePath)
	const mediaData = {}
	let videoStream = false

	if (!mediaType) try {
		mediaType = await checkFileType(tempFilePath, metadata)
	} catch (err) {
		mediaType = 'video'
	}

	Object.assign(mediaData, { tempFilePath, mediaType })

	if (mediaType === 'video' || mediaType === 'audio') {
		mediaData.duration = metadata.format.duration || 0
	}

	if (mediaType !== 'audio') {
		videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
		
		const { width, height } = videoStream

		Object.assign(mediaData, {
			width,
			height,
			aspectRatio: calculateAspectRatio(width, height)
		})
	}

	if (mediaType === 'video') {
		const thumbnail = await createScreenshot(id, tempFilePath)
		const fps = videoStream.avg_frame_rate.split('/').reduce((a, b) => a / b)

		Object.assign(mediaData, {
			thumbnail: await base64Encode(thumbnail),
			fps: forcedFPS || round(fps)
		})
	} else if (mediaType === 'image' || mediaType === 'gif') {
		const thumbnail = await createPNGCopy(id, tempFilePath, mediaType)

		mediaData.thumbnail = await base64Encode(thumbnail)
	} else {
		mediaData.thumbnail = placeholder
	}

	return mediaData
}
