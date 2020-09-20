import path from 'path'
import fs, { promises as fsp } from 'fs'

import ffmpeg from '../ffmpeg'
import { scratchDisk } from '../scratchDisk'
import { assetsPath, getOverlayInnerDimensions } from '../utilities'
import * as filter from './filters'

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
	return scratchDisk.exports.clear(id)
}

const checkIsAudio = ({ mediaType, audio }) => (
	mediaType === 'audio' || mediaType === 'video' && audio.exportAs === 'audio'
)

const checkIsStill = exportData => {
	if (exportData.mediaType !== 'image' || !exportData.autoPNG) return false

	const { arc, background } = exportData

	return (
		arc === 'none' ||
		(background === 'black' || background === 'alpha') ||
		exportData.overlay === 'none' &&
		(!exportData.hasAlpha && (
			arc === 'fill' || 
			arc === 'fit' && exportData.aspectRatio === '16:9'
		))
	)
}

const countDigits = n => {
	let count = 1

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

const copyFileNoOverwrite = async (src, dest, n = 0) => {
	let _dest = dest

	if (n > 0) {
		const extIndex = dest.lastIndexOf('.')
		const maxLength = 250 - countDigits(n)
		let truncate = 0

		if (extIndex > maxLength) truncate += extIndex - maxLength

		_dest = `${dest.slice(0, extIndex - truncate)} ${n}${dest.slice(extIndex)}`
	}

	try {
		await fsp.copyFile(src, _dest, fs.constants.COPYFILE_EXCL)
	} catch (err) {
		if (/^Error: EEXIST: file already exists/.test(err.toString())) {
			return copyFileNoOverwrite(src, dest, n + 1)
		} else {
			throw err
		}
	}
}

const checkNeedsAlpha = ({ mediaType, arc, background, overlay }) => {
	if (mediaType === 'audio') return false

	return (
		background === 'alpha' && arc !== 'none' && !(arc === 'fill' && overlay === 'none')
	)
}

const sharedVideoOptions = [
	'-b:v 7000k',
	'-preset:v ultrafast',
	'-c:a aac',
	'-b:a 192k',
	'-ar 48000',
	'-ac 2',
	'-shortest'
]

export const render = (exportData, win) => new Promise((resolve, reject) => {
	const {
		mediaType,
		id,
		hasAlpha,
		start,
		end,
		audio,
		arc,
		background,
		overlay,
		sourceData,
		rotation,
		renderOutput,
		saveLocations
	} = exportData

	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const isAudio = checkIsAudio(exportData)
	const isStill = checkIsStill(exportData)
	const needsAlpha = checkNeedsAlpha(exportData)

	let outputOptions = []
	let extension = false
	let overlayDim = false

	if (isAudio && audio.format !== 'bars') {
		outputOptions = audio.format === 'wav' ? [
			'-c:a pcm_s16le',
			'-ac 2',
			'-f wav'
		] : [
			'-c:a libmp3lame',
			'-b:a 320k',
			'-ac 2',
			'-f mp3'
		]

		extension = audio.format
	} else if (isStill) {
		extension = 'png'
	} else if (needsAlpha) {
		outputOptions = [
			'-c:v prores_ks',
			'-pix_fmt yuva444p10le',
			'-profile:v 4444',
			'-f mov',
			...sharedVideoOptions
		]

		extension = 'mov'
	} else {
		outputOptions = [
			'-c:v libx264',
			'-crf 17',
			'-f mp4',
			...sharedVideoOptions
		]

		extension = 'mp4'
	}

	const exportPath = path.join(scratchDisk.exports.path, `${id}.${extension}`)
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
				await Promise.all(saveLocations.map(saveLocation => (
					copyFileNoOverwrite(exportPath, path.join(saveLocation.directory, saveName))
				)))

				win.webContents.send(`renderComplete_${id}`)
				resolve()
			} catch (err) {
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
		reject(new Error('Start timecode exceeds duration'))
	}

	if (start.enabled && end.enabled && end.tc <= start.tc) {
		reject(new Error('End timecode preceeds start timecode'))
	}

	if (start.enabled) command.seekInput(start.tc)
	if (end.enabled) command.duration(start.enabled ? end.tc - start.tc : end.tc)

	if (!isAudio) {
		if (!isStill) {
			if (mediaType === 'video' && audio.exportAs === 'video') command.noAudio()
			if (mediaType === 'image') command.loop(7)
	
			if (exportData.renderFrameRate === '59.94fps' || exportData.acquisitionType === 'screen_record') {
				command.outputOption('-r 59.94')
			}
		}
	
		if (sourceData) {
			const sourcePng = path.join(scratchDisk.imports.path, `${id}.src-overlay.png`)
			fs.writeFileSync(sourcePng, sourceData, { encoding: 'base64' })		
			command.input(sourcePng)
		}

		if (arc !== 'none' && !(arc === 'fill' && overlay === 'none' && !hasAlpha)) {
			if (background === 'blue' || background === 'grey') {
				command
					.input(path.join(assetsPath, renderHeight, `${background}.mov`))
					.inputOption('-stream_loop -1')
			} else {
				command
					.input(`color=c=black@${needsAlpha ? 0 : 1}.0:s=${renderWidth}x${renderHeight}:rate=59.94${needsAlpha ? ',format=rgba' : ''}`)
					.inputOption('-f lavfi')
			}
		}

		if (arc !== 'none' && overlay !== 'none') {
			command
				.input(path.join(assetsPath, renderHeight, `${overlay}.png`))
				.input(`color=c=black:size=${renderWidth}x${renderHeight}:rate=59.94`)
				.inputOption('-f lavfi')

			overlayDim = getOverlayInnerDimensions(renderHeight, overlay)
		}

		command.complexFilter(filter[arc]({
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
		}))
	} else if (audio.format === 'bars') {
		command
			.input(`smptebars=size=${renderWidth}x${renderHeight}:rate=59.94`)
			.inputOption('-f lavfi')

		if (mediaType === 'video') {
			command.complexFilter(filter.videoToBars({ renderWidth, renderHeight }))
		}
	}
	
	command.run()

	jobs.push({ id, command })

	win.webContents.send(`renderStarted_${id}`)
})
