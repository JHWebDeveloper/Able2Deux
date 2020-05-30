import { promises as fsp } from 'fs'
import path from 'path'

import ffmpeg from '../utilities/ffmpeg'
import placeholder from '../utilities/placeholder'
import { temp } from '../utilities/extFileHandlers'

const round = (n, dec = 2) => (
	Number(`${Math.round(`${n}e${dec}`)}e-${dec}`)
)

const base64Encode = async file => {
	if (!file) return placeholder

  try {
    return `data:image/png;base64,${await fsp.readFile(file, 'base64')}`
  } catch (err) {
    return placeholder
  }
}

const createThumbnail = (id, tempFilePath) => new Promise(resolve => {
  const screenshot = `${id}.screenshot.jpg`

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

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)

const calculateAspectRatio = (a, b) => {
	const _gcd = gcd(a, b)

	return `${a / _gcd}:${b / _gcd}`
}

export const getMediaInfo = (id, mediaType, tempFilePath) => new Promise((resolve, reject) => {
	ffmpeg(tempFilePath).ffprobe(async (ffprobeErr, metadata) => {
		if (ffprobeErr) reject(ffprobeErr)

		try {
			const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
			const { width, height, avg_frame_rate } = videoStream
			const { duration } = metadata.format

			const mediaData = {
				tempFilePath,
				width,
				height,
				aspectRatio: calculateAspectRatio(width, height)
			}

			if (mediaType === 'image' || mediaType === 'gif') {
				mediaData.thumbnail = await base64Encode(tempFilePath)
			} else {
				const thumbnail = await createThumbnail(id, tempFilePath)
				const fr = avg_frame_rate.split('/')
	
				mediaData.thumbnail = await base64Encode(thumbnail)
				mediaData.fps = round(fr[0] / fr[1])
				mediaData.duration = duration || 0
			}

			resolve(mediaData)
		} catch (err) {
			reject(err)
		}
	})
})
