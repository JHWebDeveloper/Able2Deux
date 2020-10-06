import path from 'path'
import fs from 'fs'

import ffmpeg from '../ffmpeg'
import { scratchDisk } from '../scratchDisk'
import { assetsPath, base64Encode, getOverlayInnerDimensions } from '../utilities'
import * as filter from './filters'

const previewStill = exportData => new Promise((resolve, reject) => {
	const { id, renderOutput, hasAlpha, isAudio, arc, background, overlay, sourceData, rotation } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const outputExtension = isAudio ? 'png' : 'jpg'
	const previewSourcePath = path.join(scratchDisk.previews.path, `${id}.preview-source.${hasAlpha ? 'tiff' : outputExtension}`)
	const previewPath = path.join(scratchDisk.previews.path, `${id}.preview.${outputExtension}`)
	let overlayDim = {}

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
		if (background === 'blue' || background === 'grey') {
			command.input(path.join(assetsPath, renderHeight, `${background}.jpg`))
		} else if (background === 'alpha') {
			command.input(path.join(assetsPath, renderHeight, 'alpha.jpg'))
		} else {
			command
				.input(`color=c=black:s=${renderWidth}x${renderHeight}`)
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
			crop: exportData.crop
		}, true))
		.run()
})

export default previewStill
