import fs, { promises as fsp } from 'fs'
import path from 'path'
import { v1 as uuid } from 'uuid'

import * as filter from './filters'
import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'

import {
	base64EncodeOrPlaceholder, 
	assetsPath,
	base64Encode,
	getOverlayInnerDimensions
} from '../utilities'

export const createPreviewStill = exportData => new Promise((resolve, reject) => {
	const { id, renderOutput, hasAlpha, isAudio, arc, background, overlay, sourceData, rotation } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const outputExtension = isAudio ? 'png' : 'jpg'
	const previewSourcePath = path.join(scratchDisk.previews.path, `${id}.preview-source.${hasAlpha ? 'tiff' : outputExtension}`)
	const previewPath = path.join(scratchDisk.previews.path, `${id}.preview.${outputExtension}`)
	let overlayDim = false

	const command = ffmpeg(previewSourcePath)
		.outputOption('-q:v 2')
		.output(previewPath)
		.on('end', async () => {
			resolve(await base64Encode(previewPath))
		})
		.on('error', reject)

	if (exportData.isAudio) return command.run()

	if (sourceData) {
		const sourcePng = path.join(scratchDisk.previews.path, `${id}.src-overlay.png`)
		fs.writeFileSync(sourcePng, sourceData, 'base64')		
		command.input(sourcePng)
	}

	if (arc !== 'none' && !(arc === 'fill' && overlay === 'none' && !hasAlpha)) {
		if (background !== 'alpha' && background !== 'color') {
			command.input(path.join(assetsPath, renderHeight, `${background}.jpg`))
		} else if (background === 'alpha') {
			command.input(path.join(assetsPath, renderHeight, 'alpha.jpg'))
		} else {
			command
				.input(`color=c=${exportData.bgColor}:s=${renderWidth}x${renderHeight}`)
				.inputOption('-f lavfi')
		}
	}

	if (arc !== 'none' && overlay !== 'none') {
		command
			.input(path.join(assetsPath, renderHeight, `${overlay}.png`))
			.input(`color=c=black:s=${renderWidth}x${renderHeight}`)
			.inputOption('-f lavfi')

		overlayDim = getOverlayInnerDimensions(renderHeight, overlay)
	}

	command
		.complexFilter(filter[arc]({
			...rotation,
			renderHeight,
			renderWidth,
			overlayDim,
			hasAlpha,
			sourceData: !!sourceData,
			centering: exportData.centering,
			position: exportData.position,
			scale: exportData.scale,
			crop: exportData.crop,
			keying: exportData.keying
		}, true))
		.run()
})

const createPreviewSource = ({ id, mediaType, hasAlpha, isAudio, audio, tempFilePath, tc = 0 }) => new Promise((resolve, reject) => {
	const command = ffmpeg()
		.on('end', resolve)
		.on('error', reject)
		
	const extension = hasAlpha ? 'tiff' : isAudio ? 'png' : 'jpg'
	const outputPath = path.join(scratchDisk.previews.path, `${id}.preview-source.${extension}`)

	if (isAudio && audio.format === 'bars') {
		command
			.input('smptehdbars=size=384x216:duration=1')
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

export const changePreviewSource = async (exportData, win) => {
	await createPreviewSource(exportData)

	win.webContents.send('previewStillCreated', await createPreviewStill(exportData))
}

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
