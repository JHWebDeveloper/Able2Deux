import path from 'path'
import getRGBAPalette from 'get-rgba-palette'
import getPixels from 'get-pixels'
import log from 'electron-log'

import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'
import { supportedImageCodecs, base64EncodeOrPlaceholder } from '../utilities'

log.catchErrors({ showDialog: false })

if (process.env.NODE_ENV !== 'development') console.error = log.error

const createScreenshot = (id, tempFilePath) => new Promise(resolve => {
	const screenshot = `${id}.thumbnail.png`

	ffmpeg(tempFilePath).on('end', () => {
		resolve(path.join(scratchDisk.imports.path, screenshot))
	}).on('error', err => {
		console.error(err)
		resolve(false) // ignore error for thumbnails
	}).screenshots({
		timemarks: ['50%'],
		folder: scratchDisk.imports.path,
		filename: screenshot,
		size: '384x?'
	})
})

const createPNGCopy = (id, tempFilePath, mediaType) => new Promise(resolve => {
	const png = path.join(scratchDisk.imports.path, `${id}.thumbnail.png`)
	const opt = []

	if (mediaType === 'gif') opt.push('-frames 1')

	ffmpeg(tempFilePath)
		.outputOption(opt)
		.output(png)
		.size('384x?')
		.on('error', err => {
			console.error(err)
			resolve(false)
		})
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

const createFileError = filepath => new Error(`${path.basename(filepath)} is not a supported file type`)

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
			console.error(err)
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
	let metadata = {}
	let codecs = {}

	try {
		[ metadata, codecs ] = await Promise.all([
			preGeneratedMetadata || getMetadata(file),
			getSupportedCodecList()
		])
	} catch (err) {
		throw err
	}

	if (!metadata.streams || metadata.streams.length === 0) {
		throw createFileError(file)
	}

	const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
	const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio')
	const videoSupport = codecs[videoStream?.codec_name]?.canDecode
	const audioSupport = codecs[audioStream?.codec_name]?.canDecode

	if (audioSupport && (!videoStream || supportedImageCodecs.includes(videoStream?.codec_name))) { // audio only or audio with album artwork
		return 'audio'
	} else if (videoSupport && (audioSupport || !audioStream)) { // video+audio or video only
		return getMediaKind(videoStream.codec_name, path.extname(file))
	} else {
		throw createFileError(file)
	}
}

const checkMetadata = data => !!data && data !== 'unknown' && data !== 'N/A'

const frameRateToNumber = fps => parseFloat(fps.split('/').reduce((a, b) => a / b).toFixed(2))

export const getMediaInfo = async (id, tempFilePath, mediaType, forcedFPS) => {
	const metadata = await getMetadata(tempFilePath)
	const mediaData = {}
	let videoStream = {}

	if (!mediaType) try {
		mediaType = await checkFileType(tempFilePath, metadata)
	} catch (err) {
		mediaType = 'video'
	}

	Object.assign(mediaData, { tempFilePath, mediaType })

	if (mediaType === 'video' || mediaType === 'audio') {
		const { duration } = metadata.format

		if (!checkMetadata(duration)) {
			throw new Error('Cannot detect media duration')
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
		
		const { width, height } = videoStream
		const hasW = checkMetadata(width)
		const hasH = checkMetadata(height)
		const hasAlpha = await detectAlphaChannel(tempFilePath, mediaType, id)

		Object.assign(mediaData, {
			width: hasW ? width : 0,
			height: hasH ? height : 0,
			aspectRatio: hasW && hasH ? calculateAspectRatio(width, height) : '',
			hasAlpha
		})

		Object.assign(mediaData, {
			originalWidth: mediaData.width,
			originalHeight: mediaData.height,
			originalAspectRatio: mediaData.aspectRatio
		})
	}

	if (mediaType === 'video') {
		const thumbnail = await createScreenshot(id, tempFilePath)
		const { avg_frame_rate } = videoStream
		const fps = forcedFPS || (checkMetadata(avg_frame_rate) ? frameRateToNumber(avg_frame_rate) : 0)
		const totalFrames = mediaData.duration * fps

		Object.assign(mediaData, {
			thumbnail: await base64EncodeOrPlaceholder(thumbnail),
			end: totalFrames,
			totalFrames,
			fps
		})
	} else if (mediaType === 'image' || mediaType === 'gif') {
		const thumbnail = await createPNGCopy(id, tempFilePath, mediaType)

		mediaData.thumbnail = await base64EncodeOrPlaceholder(thumbnail)
	} else {
		mediaData.thumbnail = await base64EncodeOrPlaceholder(false)
	}

	return mediaData
}
