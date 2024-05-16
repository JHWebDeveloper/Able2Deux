import path from 'path'
import getRGBAPalette from 'get-rgba-palette'
import getPixels from 'get-pixels'

import { createPNGCopyAsScreenshot, createScreenshot } from './thumbnails'
import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'
import { SUPPORTED_IMAGE_CODECS } from '../constants'

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)

const calcAspectRatio = (a, b) => {
	const ratio = a / b

	if (ratio === 1.89) return '1.89:1'
	if (ratio === 2.35) return '2.35:1'
	if (ratio === 2.39) return '2.39:1'

	const _gcd = gcd(a, b)

	return `${a / _gcd}:${b / _gcd}`
}

const getVisualMediaType = (codec, ext) => {
	if (/^gif|apng$/i.test(codec) || /^mjpegb?$/i.test(codec) && /^mjpe?g$/i.test(ext)) {
		return 'gif'
	} else if (SUPPORTED_IMAGE_CODECS.includes(codec)) {
		return 'image'
	} else {
		return 'video'
	}
}

const createFileError = filepath => new Error(`${path.basename(filepath)} is not a supported file type.`)

const getMetadata = file => new Promise((resolve, reject) => {
	ffmpeg.ffprobe(file, (err, metadata) => {
		if (err) {
			console.error(err)
			reject(createFileError(file))
		} else {
			resolve(metadata)
		}
	})
})

const detectImageNecessaryAlphaChannel = id => new Promise((resolve, reject) => {
	getPixels(path.join(scratchDisk.imports.path, `${id}.alpha.jpg`), (err, pixels) => {
		if (err) reject(err)

		const colors = getRGBAPalette(pixels.data)
		const isWhite = colors.every(color => color.every(ch => ch > 250))

		resolve(!isWhite)
	})
})

const detectAlphaChannel = (file, mediaType, id) => new Promise(resolve => {
	const isImage = mediaType === 'image'

	ffmpeg(file)
		.on('end', async () => {
			if (isImage && id) {
				resolve(await detectImageNecessaryAlphaChannel(id))
			} else {
				resolve(true)
			}
		})
		.on('error', err => {
			if (!err.toString().startsWith('Error: ffmpeg exited with code 1: Error reinitializing filters!')) {
				console.error(err)
			}

			resolve(false)
		})
		.videoFilter('alphaextract,format=yuv420p')
		.output(isImage ? path.join(scratchDisk.imports.path, `${id}.alpha.jpg`) : 'out.null')
		.outputOption(isImage ? [] : ['-f null'])
		.run()
})

const getSupportedCodecList = () => new Promise((resolve, reject) => {
	ffmpeg.getAvailableCodecs((err, codecs) => {
		if (err) {
			console.error(err)
			reject(new Error('Unable to retrieve available codecs.'))
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
		throw createFileError(file)
	}

	const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
	const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio')

	const videoSupport = !!codecs[videoStream?.codec_name]?.canDecode || videoStream?.codec_name === 'prores'
	const audioSupport = !!codecs[audioStream?.codec_name]?.canDecode
	const streamData = { hasAudio: !!audioStream }

	if (audioSupport && (!videoStream || SUPPORTED_IMAGE_CODECS.includes(videoStream?.codec_name))) { // audio only or audio with album artwork
		streamData.mediaType = 'audio'
	} else if (videoSupport && (audioSupport || !audioStream)) { // video+audio or video only
		streamData.mediaType = getVisualMediaType(videoStream.codec_name, path.extname(file))
	} else {
		throw createFileError(file)
	}

	return streamData
}

const checkMetadata = data => !!data && data !== 'unknown' && data !== 'N/A'

const getDimensionsAndAR = ({
	sample_aspect_ratio: sar,
	display_aspect_ratio: dar,
	width,
	height
}) => {
	const hasW = checkMetadata(width)
	const hasH = checkMetadata(height)
	const hasWH = hasW && hasH
	let aspectRatio = ''
	let displayAspectRatio = 1
	let isAnamorphic = false

	width = hasW ? width : 0
	height = hasH ? height : 0

	if (hasWH) aspectRatio = calcAspectRatio(width, height)

	if (hasWH && checkMetadata(dar)) {
		displayAspectRatio = dar.split(':').map(parseFloat)
		
		isAnamorphic = !(
			sar === '1:1' ||
			sar === '0:1' ||
			dar === '0:1' ||
			calcAspectRatio(...displayAspectRatio) === aspectRatio
		)
	}

	if (isAnamorphic) {
		const [ a, b ] = displayAspectRatio

		width = a / b * height
		aspectRatio = calcAspectRatio(width, height)
	}

	return {
		width,
		height,
		aspectRatio,
		originalWidth: width,
		originalHeight: height,
		originalAspectRatio: aspectRatio,
		isAnamorphic
	}
}

const frameRateToNumber = fps => parseFloat(fps.split('/').reduce((a, b) => a / b).toFixed(2))

export const getMediaInfo = async (id, tempFilePath, streamData, forcedFPS) => {
	const metadata = await getMetadata(tempFilePath)
	const mediaData = {}
	let videoStream = {}

	if (!streamData) try {
		streamData = await checkFileType(tempFilePath, metadata)
	} catch {
		streamData = { mediaType: 'video', hasAudio: false }
	}

	Object.assign(mediaData, { tempFilePath, ...streamData })

	const { mediaType } = streamData

	if (mediaType === 'video' || mediaType === 'audio') {
		const { duration } = metadata.format

		if (!checkMetadata(duration)) {
			throw new Error('Cannot detect media duration.')
		}

		mediaData.duration = duration
	}

	if (mediaType === 'audio') {
		const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio')
		const { channel_layout, bit_rate, sample_rate } = audioStream
		const fps = 59.94
		const totalFrames = mediaData.duration * fps

		Object.assign(mediaData, {
			fps,
			totalFrames,
			end: totalFrames,
			channelLayout: checkMetadata(channel_layout)
				? channel_layout.toString()
				: '',
			bitRate: checkMetadata(bit_rate)
				? bit_rate < 1000 ? `${bit_rate}bps` : `${bit_rate / 1000}kbps`
				: '',
			sampleRate: checkMetadata(sample_rate)
				? sample_rate < 1000 ? `${sample_rate}hz` : `${sample_rate / 1000}khz`
				: ''
		})
	} else {
		videoStream = metadata.streams.find(stream => stream.codec_type === 'video')

		Object.assign(mediaData, getDimensionsAndAR(videoStream))

		mediaData.hasAlpha = await detectAlphaChannel(tempFilePath, mediaType, id)
	}

	if (mediaType === 'video') {
		await createScreenshot(id, tempFilePath)

		const { avg_frame_rate } = videoStream
		const fps = forcedFPS || (checkMetadata(avg_frame_rate) ? frameRateToNumber(avg_frame_rate) : 0)
		const totalFrames = mediaData.duration * fps

		Object.assign(mediaData, {
			end: totalFrames,
			totalFrames,
			fps
		})
	} else if (mediaType === 'image' || mediaType === 'gif') {
		await createPNGCopyAsScreenshot(id, tempFilePath, mediaType)
	}

	mediaData.importCompleted = new Date()

	return mediaData
}
