import path from 'path'
import fs, { promises as fsp } from 'fs'
import { fixPathForAsarUnpack } from 'electron-util'

import ffmpeg from '../utilities/ffmpeg'
import { temp } from '../utilities/extFileHandlers'
import * as filter from './filters'
import getOverlayInnerDimensions from './getOverlayInnerDimensions'

const assetsPath = fixPathForAsarUnpack(process.env.NODE_ENV === 'development' 
	? path.resolve(__dirname, '..', '..', 'assets')
	: path.join(__dirname, 'assets'))

const previewStill = exportData => new Promise((resolve, reject) => {
	const { id, renderOutput, arc, background, overlay, sourceData, rotation } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const previewSourcePath = path.join(temp.previews.path, `${id}.preview-source.jpg`)
	const previewPath = path.join(temp.previews.path, `${id}.preview.jpg`)
	let backgroundFile = false
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
		backgroundFile = path.join(assetsPath, renderHeight, `${background}.jpg`)
	}

	if (arc !== 'none' && overlay !== 'none') {
		const overlayPng = path.join(assetsPath, renderHeight, `${overlay}.png`)

		command.input(backgroundFile).input(overlayPng)
		
		backgroundFile = path.join(assetsPath, renderHeight, 'black.jpg')
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
		filter.fit(command, backgroundFile, filterData, true)
	} else if (arc === 'transform') {
		filter.transform(command, backgroundFile, {
			...filterData,
			position: exportData.position,
			scale: exportData.scale,
			crop: exportData.crop
		}, true)
	}

	command.run()
})

export default previewStill
