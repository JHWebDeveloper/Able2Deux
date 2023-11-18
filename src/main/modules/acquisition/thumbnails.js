import path from 'path'

import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'
import { base64EncodeOrPlaceholder } from '../utilities'

const createThumbnailFilename = id => `${id}.thumbnail.png`
const createThumbnailPath = id => path.join(scratchDisk.imports.path, createThumbnailFilename(id))

export const createScreenshot = (id, tempFilePath) => new Promise(resolve => {
	const screenshot = createThumbnailFilename(id)

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

export const createPNGCopyAsScreenshot = (id, tempFilePath, mediaType) => new Promise(resolve => {
	const png = createThumbnailPath(id)
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

export const getThumbnailBase64 = async id => base64EncodeOrPlaceholder(id && createThumbnailPath(id))
