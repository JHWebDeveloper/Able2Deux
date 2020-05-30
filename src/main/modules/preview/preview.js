import path from 'path'
import fs, { promises as fsp } from 'fs'
import { fixPathForAsarUnpack } from 'electron-util'

import ffmpeg from '../utilities/ffmpeg'
import { temp } from '../utilities/extFileHandlers'
import * as filter from './filters'

const assetsPath = fixPathForAsarUnpack(process.env.NODE_ENV === 'development' 
	? path.resolve(__dirname, '..', '..', 'assets')
	: path.join(__dirname, 'assets'))

const getOverlayInnerDimensions = (size, overlay) => {
	const is1080 = size === '1080'

	return {
		tv: {
			width: is1080 ? 1576 : 1050,
			height: is1080 ? 886 : 590,
			y: is1080 ? 78 : 52
		},
		laptop: {
			width: is1080 ? 1366 : 912,
			height: is1080 ? 778 : 518,
			y: is1080 ? 86 : 58
		}
	}[overlay]
}

const previewStill = exportData => new Promise((resolve, reject) => {
	const { id, renderOutput, arc, background, overlay, sourceData, rotation } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const previewSourcePath = path.join(temp.previews.path,`${id}.preview-source.jpg`)
	const previewPath = path.join(temp.previews.path, `${id}.preview.jpg`)
	const backgroundFile = path.join(assetsPath, renderHeight, `${overlay === 'none' ? background : 'black'}.jpg`)

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

	if (overlay !== 'none') {
		const overlayPng = path.join(assetsPath, renderHeight, `${overlay}.png`)

		command
			.input(path.join(assetsPath, renderHeight, `${background}.jpg`))
			.input(overlayPng)

		overlayDim = getOverlayInnerDimensions(renderHeight, overlay)
	}

	const filterData = {
		...rotation,
		renderHeight,
		renderWidth,
		sourceData,
		overlayDim
	}

	if (arc === 'none') {
		filter.none(command, filterData)
	} else if (arc === 'fill') {
		filter.fill(command, {
			...filterData,
			centering: exportData.centering
		})
	} else if (arc === 'fit') {
		filter.fit(command, backgroundFile, filterData)
	} else if (arc === 'transform') {
		filter.transform(command, backgroundFile, {
			...filterData,
			position: exportData.position,
			scale: exportData.scale,
			crop: exportData.crop
		})
	}

	command.run()
})

export default previewStill
