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

let jobs = []

export const cancelRender = async id => {
	if (jobs.length) {
		await jobs.find(job => job.id === id).command.kill()
	}
}

export const cancelAllRenders = async () => (
	Promise.all(jobs.map(job => job.command.kill()))
)

const removeJob = async id => {
	jobs = jobs.filter(dl => dl.id !== id)
	return temp.exports.clear(id)
}

export const render = (exportData, win) => new Promise((resolve, reject) => {
	const { id, arc, background, overlay, sourceData, rotation, renderOutput, saveLocations, start, end } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const needsAlpha = background === 'alpha' && (arc === 'fit' || arc === 'transform')
	const extension  = needsAlpha ? 'mov' : 'mp4'
	const exportPath = path.join(temp.exports.path, `${id}.${extension}`)
	const saveName = `${exportData.filename}.${extension}`
	let backgroundFile = false
	let overlayDim = false

	const command = ffmpeg(exportData.tempFilePath)
		.outputOptions(needsAlpha ? [
			'-vcodec prores_ks',
			'-pix_fmt yuva444p10le',
			'-profile:v 4444',
			'-preset:v ultrafast'
		] : [
			'-vcodec h264',
			'-b:v 7000k',
			'-b:a 192k',
			'-crf 17',
			'-preset:v ultrafast'
		])
		.output(exportPath)
		.on('progress', progress => {
			win.webContents.send(`renderProgress_${id}`, {
				id,
				...progress
			})
		})
		.on('end', async () => {
			try {
				await Promise.all(saveLocations.map(location => (
					fsp.copyFile(exportPath, path.join(location.directory, saveName))
				)))

				win.webContents.send(`renderComplete_${id}`)
				resolve()
			} catch (err) {
				win.webContents.send(`renderErr_${id}`)
				reject(err)
			} finally {
				removeJob(id)
			}
		})
		.on('error', async err => {
			try {
				await cancelRender(id)
			} catch (err) {
				console.error(err)
			} finally {
				removeJob(id)
				reject(err)
			}
		})

	if (start.enabled) command.seekInput(start.tc)
	if (end.enabled) command.duration(start.enabled ? end.tc - start.tc : end.tc)
	if (exportData.mediaType === 'image') command.loop(7)

	if (sourceData) {
		const sourcePng = path.join(temp.imports.path, `${id}.src-overlay.png`)
		fs.writeFileSync(sourcePng, sourceData, 'base64')		
		command.input(sourcePng)
	}

	if (arc !== 'none' && !(arc === 'fill' && overlay === 'none')) {
		backgroundFile = path.join(assetsPath, renderHeight, `${background}.${background === 'blue' || background === 'grey' ? 'mov' : 'png'}`)
	}

	if (arc !== 'none' && overlay !== 'none') {
		const overlayPng = path.join(assetsPath, renderHeight, `${overlay}.png`)

		command.input(backgroundFile).input(overlayPng)
		
		backgroundFile = path.join(assetsPath, renderHeight, 'black.png')
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

	jobs.push({ id, command })

	win.webContents.send(`renderStarted_${id}`)
})
