import path from 'path'
import fs, { promises as fsp } from 'fs'

import ffmpeg from '../utilities/ffmpeg'
import { temp, assetsPath } from '../utilities/extFileHandlers'
import * as filter from './filters'
import getOverlayInnerDimensions from './getOverlayInnerDimensions'

const previewStill = exportData => new Promise((resolve, reject) => {
	const { id, renderOutput, arc, background, overlay, sourceData, rotation } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const previewSourcePath = path.join(temp.previews.path, `${id}.preview-source.jpg`)
	const previewPath = path.join(temp.previews.path, `${id}.preview.jpg`)
	let overlayDim = false

	const command = ffmpeg(previewSourcePath)
		.outputOptions(['-q:v 2'])
		.output(previewPath)
		.on('end', async () => {
			const dataURL = await fsp.readFile(previewPath, 'base64')
			resolve(`data:image/png;base64,${dataURL}`)
		})
		.on('error', reject)

	if (sourceData) {
		const sourcePng = path.join(temp.previews.path, `${id}.src-overlay.png`)
		fs.writeFileSync(sourcePng, sourceData, 'base64')		
		command.input(sourcePng)
	}

	if (arc !== 'none' && !(arc === 'fill' && overlay === 'none')) {
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

	const filterData = {
		...rotation,
		renderHeight,
		renderWidth,
		overlayDim,
		sourceData: !!sourceData
	}

	if (arc === 'none') {
		filter.none(command, filterData, true)
	} else if (arc === 'fill') {
		filter.fill(command, {
			...filterData,
			centering: exportData.centering
		}, true)
	} else if (arc === 'fit') {
		filter.fit(command, filterData, true)
	} else if (arc === 'transform') {
		filter.transform(command, {
			...filterData,
			position: exportData.position,
			scale: exportData.scale,
			crop: exportData.crop
		}, true)
	}

	command.run()
})

export default previewStill
