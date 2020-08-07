import path from 'path'
import fs, { promises as fsp } from 'fs'

import ffmpeg from '../utilities/ffmpeg'
import { temp, assetsPath } from '../utilities/extFileHandlers'
import * as filter from './filters'
import getOverlayInnerDimensions from './getOverlayInnerDimensions'

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

const sharedVideoOptions = renderFrameRate => [
	...renderFrameRate === 'auto' ? [] : ['-r 59.94'],
	'-b:v 7000k',
	'-preset:v ultrafast',
	'-c:a aac',
	'-b:a 192k',
	'-ar 48000'
]

export const render = (exportData, win) => new Promise((resolve, reject) => {
	const { mediaType, id, audio, arc, background, overlay, sourceData, rotation, renderOutput, renderFrameRate, saveLocations, start, end } = exportData
	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const isAudio = mediaType === 'audio' || mediaType === 'video' && audio.exportAs === 'audio'
	const needsAlpha = !isAudio && background === 'alpha' && (arc === 'fit' || arc === 'transform')
	let outputOptions = []
	let extension = false
	let backgroundFile = false
	let overlayDim = false

	if (isAudio && audio.format === 'file') {
		outputOptions = ['-c:a pcm_s24le']

		extension = 'wav'
	} else if (needsAlpha) {
		outputOptions = [
			'-c:v prores_ks',
			'-pix_fmt yuva444p10le',
			'-profile:v 4444',
			...sharedVideoOptions(renderFrameRate)
		]

		extension = 'mov'
	} else {
		outputOptions = [
			'-c:v libx264',
			'-crf 17',
			...sharedVideoOptions(renderFrameRate)
		]

		extension = 'mp4'
	}

	const exportPath = path.join(temp.exports.path, `${id}.${extension}`)
	const saveName = `${exportData.filename}.${extension}`

	const command = ffmpeg(exportData.tempFilePath)
		.outputOptions(outputOptions)
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
	
	if (start.enabled && start.tc >= exportData.duration) {
		reject(new Error(`Bad inputs for ${exportData.filename}: start timecode exceeds duration.`))
	}

	if (start.enabled && end.enabled && end.tc <= start.tc) {
		reject(new Error(`Bad inputs for ${exportData.filename}: end timecode preceeds start timecode.`))
	}

	if (start.enabled) command.seekInput(start.tc)
	if (end.enabled) command.duration(start.enabled ? end.tc - start.tc : end.tc)

	if (!isAudio) {
		if (mediaType === 'video' && audio.exportAs === 'video') command.noAudio()
		if (mediaType === 'image') command.loop(7)
	
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
	} else if (audio.format === 'bars') {
		command
			.input(path.join(assetsPath, renderHeight, 'bars.png'))
			.loop()
			.outputOptions([
				'-r 59.94',
				'-b:v 1k',
				'-shortest'
			])

		if (mediaType === 'video') filter.videoToBars(command, { renderWidth, renderHeight })
	}
	
	command.run()

	jobs.push({ id, command })

	win.webContents.send(`renderStarted_${id}`)
})
