import { promises as fsp } from 'fs'
import path from 'path'

import ffmpeg from '../utilities/ffmpeg'
import placeholder from '../utilities/placeholder'
import { temp } from '../utilities/extFileHandlers'

import { checkFileType } from './upload'

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

export const getMediaInfo = (id, mediaType, tempFilePath) => new Promise((resolve, reject) => {
	ffmpeg(tempFilePath).ffprobe(async (ffprobeErr, metadata) => {
		if (ffprobeErr) reject(ffprobeErr)

		if (!mediaType) {
			try {
				mediaType = await checkFileType(tempFilePath)
			} catch (err) {
				mediaType = 'video'
			}
		}

		try {
			const { duration } = metadata.format
			const mediaData = { mediaType, tempFilePath }
			let videoStream = false

			if (mediaType === 'video' || mediaType === 'audio') {
				mediaData.duration = duration || 0
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
					fps: round(fps)
				})
			} else if (mediaType === 'image' || mediaType === 'gif') {
				const thumbnail = await createPNGCopy(id, tempFilePath, mediaType)

				mediaData.thumbnail = await base64Encode(thumbnail)
			} else {
				mediaData.thumbnail = placeholder
			}

			resolve(mediaData)
		} catch (err) {
			reject(err)
		}
	})
})
