import fs, { promises as fsp } from 'fs'
import path from 'path'
import { v1 as uuid } from 'uuid'

import * as filter from './filters'
import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'

import {
	assetsPath,
	base64Encode,
	base64EncodeOrPlaceholder, 
	getOverlayInnerDimensions,
	objectPick
} from '../utilities'

export const createPreviewStill = exportData => new Promise((resolve, reject) => {
	const { id, renderOutput, hasAlpha, isAudio, arc, background, overlay, sourceData } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const outputExtension = isAudio ? 'png' : 'jpg'
	const previewSourcePath = path.join(scratchDisk.previews.path, `${id}.preview-source.${hasAlpha ? 'tiff' : outputExtension}`)
	const previewPath = path.join(scratchDisk.previews.path, `${id}.preview.${outputExtension}`)
	let overlayDim = false

	const command = ffmpeg(previewSourcePath)
		.outputOption('-q:v 2')
		.output(previewPath)
		.on('end', async () => {
			resolve({
				responseId: exportData.requestId,
				base64: await base64Encode(previewPath)
			})
		})
		.on('error', reject)

	if (isAudio) return command.run()

	if (sourceData) {
		const sourcePng = path.join(scratchDisk.previews.path, `${id}.src-overlay.png`)

		fs.writeFileSync(sourcePng, sourceData.base64, 'base64')

		command.input(sourcePng)
	}

	const fillNeedsBg = arc === 'fill' && (hasAlpha || overlay !== 'none' || exportData.keying.enabled || sourceData.is11pm)
	const addBgLayer = arc === 'fit' || arc === 'transform' || fillNeedsBg

	if (addBgLayer && background === 'alpha') {
		command.input(path.join(assetsPath, renderHeight, 'alpha.jpg'))
	} else if (addBgLayer && background === 'color') {
		command
			.input(`color=c=${exportData.bgColor}:s=${renderWidth}x${renderHeight}`)
			.inputOption('-f lavfi')
	} else if (addBgLayer) {
		command.input(path.join(assetsPath, renderHeight, `${background}.jpg`))
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
			renderHeight,
			renderWidth,
			overlayDim,
			hasAlpha,
			sourceData,
			width: exportData.width,
			height: exportData.height,
			centering: exportData.centering,
			position: {
				x: exportData.positionX,
				y: exportData.positionY
			},
			scale: {
				x: exportData.scaleX,
				y: exportData.scaleY
			},
			crop: {
				t: exportData.cropT,
				r: exportData.cropR,
				b: exportData.cropB,
				l: exportData.cropL
			},
			rotation: exportData.rotation,
			keying: exportData.keying,
			colorCurves: exportData.colorCurves
		}, true, exportData.previewSize))
		.run()
})

const createPreviewSource = ({ id, mediaType, hasAlpha, isAudio, isBars, timecode, fps, duration, tempFilePath, previewSize }) => new Promise((resolve, reject) => {
	const command = ffmpeg()
		.on('end', resolve)
		.on('error', reject)
	
	const extension = hasAlpha ? 'tiff' : isAudio ? 'png' : 'jpg'
	const outputPath = path.join(scratchDisk.previews.path, `${id}.preview-source.${extension}`)

	if (isAudio && isBars) {
		command
			.input(`smptehdbars=size=${previewSize.width}x${previewSize.height}:duration=1`)
			.inputOption('-f lavfi')
			.output(outputPath)
			.outputOption('-frames 1')
			.run()
	} else if (isAudio) {
		const tcInSeconds = timecode / fps

		command
			.input(tempFilePath)
			.seekInput(tcInSeconds)
			.inputOption(`-to ${tcInSeconds + 1 / fps}`)
			.complexFilter(`showwavespic=size=${previewSize.width}x${previewSize.height}:colors=#EEEEEE:split_channels=1`)
			.output(outputPath)
			.outputOption('-frames:v 1')
			.run()
	} else if (mediaType === 'video') {
		command
			.input(tempFilePath)
			.screenshot({
				timemarks: [`${timecode / fps / duration * 100}%`],
				folder: scratchDisk.previews.path,
				filename: `${id}.preview-source.${extension}`
			})
	} else {
		const opts = hasAlpha ? [] : ['-q:v 2']

		if (mediaType === 'gif') opts.push('-frames 1')

		command
			.input(tempFilePath)
			.outputOptions(opts)
			.output(outputPath)
			.run()
	}
})

export const renderPreview = (() => {
	const previewSourceDynamicKeys = ['timecode', 'id', 'isAudio', 'isBars']
	let prevExportData = {}

	const shouldCreateNewPreviewSource = exportData => {		
		for (const key of previewSourceDynamicKeys) {
			if (exportData[key] !== prevExportData[key]) return true
		}

		return false
	}

	return async exportData => {
		if (shouldCreateNewPreviewSource(exportData)) await createPreviewSource(exportData)

		prevExportData = objectPick(exportData, previewSourceDynamicKeys)

		return createPreviewStill(exportData)
	}
})()

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
