import path from 'path'
import fs, { promises as fsp } from 'fs'

import ffmpeg from '../ffmpeg'
import { scratchDisk } from '../scratchDisk'
import { assetsPath, getOverlayInnerDimensions } from '../utilities'
import * as filter from './filters'

let renderJobs = []

export const cancelRender = async id => {
	if (renderJobs.length) {
		await renderJobs.find(job => job.id === id).cmd.kill()
	}
}

export const cancelAllRenders = async () => Promise.all(renderJobs.map(job => job.cmd.kill()))

const removeJob = async id => {
	renderJobs = renderJobs.filter(dl => dl.id !== id)
	return scratchDisk.exports.clear(id)
}

// eslint-disable-next-line no-extra-parens
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

const getIntegerLength = n => {
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
		const maxLength = 250 - getIntegerLength(n)
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

	const renderCmd = ffmpeg(exportData.tempFilePath)
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
				// eslint-disable-next-line no-extra-parens
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

	if (start.enabled && end.enabled && end.tc <= start.tc) {
		reject(new RangeError('End timecode preceeds start timecode.'))
	}

	if (start.enabled && start.tc >= exportData.duration) {
		reject(new RangeError('Start timecode exceeds duration.'))
	}

	if (end.enabled && end.tc === 0) {
		reject(new RangeError('End timecode is set to zero. Media has no duration.'))
	} 

	if (start.enabled) renderCmd.seekInput(start.tc)
	if (end.enabled) renderCmd.duration(start.enabled ? end.tc - start.tc : end.tc)

	if (!isAudio) {
		if (!isStill) {
			if (mediaType === 'video' && audio.exportAs === 'video') renderCmd.noAudio()
			if (mediaType === 'image') renderCmd.loop(7)
	
			if (exportData.renderFrameRate === '59.94fps' || exportData.acquisitionType === 'screen_record') {
				renderCmd.outputOption('-r 59.94')
			}
		}
	
		if (sourceData) {
			const sourcePng = path.join(scratchDisk.imports.path, `${id}.src-overlay.png`)
			fs.writeFileSync(sourcePng, sourceData, { encoding: 'base64' })		
			renderCmd.input(sourcePng)
		}

		if (arc !== 'none' && !(arc === 'fill' && overlay === 'none' && !hasAlpha)) {
			if (background === 'blue' || background === 'grey') {
				renderCmd
					.input(path.join(assetsPath, renderHeight, `${background}.mov`))
					.inputOption('-stream_loop -1')
			} else {
				renderCmd
					.input(`color=c=black@${needsAlpha ? 0 : 1}.0:s=${renderWidth}x${renderHeight}:rate=59.94${needsAlpha ? ',format=rgba' : ''}`)
					.inputOption('-f lavfi')
			}
		}

		if (arc !== 'none' && overlay !== 'none') {
			renderCmd
				.input(path.join(assetsPath, renderHeight, `${overlay}.png`))
				.input(`color=c=black:size=${renderWidth}x${renderHeight}:rate=59.94`)
				.inputOption('-f lavfi')

			overlayDim = getOverlayInnerDimensions(renderHeight, overlay)
		}

		renderCmd.complexFilter(filter[arc]({
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
		renderCmd
			.input(`smptebars=size=${renderWidth}x${renderHeight}:rate=59.94`)
			.inputOption('-f lavfi')

		if (mediaType === 'video') {
			renderCmd.complexFilter(filter.videoToBars({ renderWidth, renderHeight }))
		}
	}
	
	renderCmd.run()

	renderJobs.push({ id, cmd: renderCmd })

	win.webContents.send(`renderStarted_${id}`)
})
