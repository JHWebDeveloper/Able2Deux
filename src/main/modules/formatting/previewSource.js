import { promises as fsp } from 'fs'
import path from 'path'
import { v1 as uuid } from 'uuid'

import ffmpeg from '../ffmpeg'
import { scratchDisk } from '../scratchDisk'
import { base64EncodeOrPlaceholder } from '../utilities'

export const updatePreviewSourceImage = ({ id, mediaType, hasAlpha, isAudio, format, tempFilePath, tc = 0 }) => new Promise((resolve, reject) => {
	const command = ffmpeg()
		.on('end', resolve)
		.on('error', reject)
		
	const extension = hasAlpha ? 'tiff' : isAudio ? 'png' : 'jpg'
	const outputPath = path.join(scratchDisk.previews.path, `${id}.preview-source.${extension}`)

	if (isAudio && format === 'bars') {
		command
			.input('smptebars=size=384x216:duration=1')
			.inputOption('-f lavfi')
			.output(outputPath)
			.outputOption('-frames 1')
			.run()
	} else {
		command.input(tempFilePath)

		if (isAudio) {
			command
				.complexFilter('showwavespic=size=384x216:colors=#EEEEEE:split_channels=1')
				.output(outputPath)
				.outputOption('-frames:v 1')
				.run()
		} else if (mediaType === 'video') {
			command.screenshot({
				timemarks: [`${tc}%`],
				folder: scratchDisk.previews.path,
				filename: `${id}.preview-source.${extension}`
			})
		} else {
			const opts = hasAlpha ? [] : ['-q:v 2']

			if (mediaType === 'gif') opts.push('-frames 1')
	
			command
				.outputOptions(opts)
				.output(outputPath)
				.run()
		}
	}

})

export const copyPreviewToImports = async ({ oldId, hasAlpha }) => {
	const newId = uuid()
	const extension = hasAlpha ? 'tiff' : 'jpg'
	const oldPath = path.join(scratchDisk.previews.path, `${oldId}.preview-source.${extension}`)
	const newPath = path.join(scratchDisk.imports.path, `${newId}.${extension}`)

	await fsp.copyFile(oldPath, newPath)

	return {
		id: newId,
		thumbnail: await base64EncodeOrPlaceholder(newPath),
		tempFilePath: newPath
	}
}

export default updatePreviewSourceImage
