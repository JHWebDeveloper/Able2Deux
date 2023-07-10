import path from 'path'
import fs, { promises as fsp } from 'fs'

import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'

import {
	assetsPath,
	getIntegerLength,
	getOverlayInnerDimensions
} from '../utilities'

import * as filter from './filters'

const renderJobs = new Map()

export const cancelRender = id => renderJobs.get(id)?.kill()

const removeJob = async id => {
	if (id) {
		renderJobs.delete(id)
	} else {
		renderJobs.clear()
	}

	try {		
		await scratchDisk.exports.clear(id)
	} catch (err) {
		console.error(err)
	}
}

// eslint-disable-next-line no-extra-parens
const checkIsAudio = ({ mediaType, audioVideoTracks }) => (
	mediaType === 'audio' || mediaType === 'video' && audioVideoTracks === 'audio'
)

// eslint-disable-next-line no-extra-parens
const checkNeedsAlpha = ({ mediaType, arc, background, overlay, hasAlpha }) => (
	mediaType !== 'audio' && background === 'alpha' && arc !== 'none' && !(arc === 'fill' && overlay === 'none' && !hasAlpha)
)

const checkIsStill = exportData => {
	if (exportData.mediaType !== 'image' || !exportData.autoPNG) return false

	const { arc, backgroundMotion, background, overlay, hasAlpha, aspectRatio } = exportData

	return (
		arc === 'none' ||
		backgroundMotion === 'still' ||
		background === 'color' ||
		background === 'alpha' ||
		overlay === 'none' && (!hasAlpha && (arc === 'fill' || arc === 'fit' && aspectRatio === '16:9'))
	)
}

const getBgDuration = background => {
	switch (background) {
		case 'light_blue':
		case 'dark_blue':
		case 'teal':
		case 'tan':
			return 6.967
		case 'blue':
			return 7.033
		default:
			return 7
	}
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
		if (err.toString().startsWith('Error: EEXIST: file already exists')) {
			return copyFileNoOverwrite(src, dest, n + 1)
		} else {
			throw err
		}
	}
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
		fps,
		totalFrames,
		audioVideoTracks,
		audioExportFormat,
		arc,
		background,
		backgroundMotion,
		overlay,
		sourceData,
		renderOutput,
		renderFrameRate,
		saveLocations
	} = exportData

	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const isAudio = checkIsAudio(exportData)
	const isStill = checkIsStill(exportData)
	const needsAlpha = checkNeedsAlpha(exportData)

	let outputOptions = []
	let extension = ''
	let overlayDim = false

	if (isAudio && audioExportFormat !== 'bars') {
		outputOptions = audioExportFormat === 'wav' ? [
			'-c:a pcm_s16le',
			'-ac 2',
			'-f wav'
		] : [
			'-c:a libmp3lame',
			'-b:a 320k',
			'-ac 2',
			'-f mp3'
		]

		extension = audioExportFormat
	} else if (isStill) {
		outputOptions = [
			'-pix_fmt rgb24'
		]

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
			'-crf 18',
			'-pix_fmt yuv420p',
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
				const res = await Promise.allSettled(saveLocations.map(dir => (
					copyFileNoOverwrite(exportPath, path.join(dir, saveName))
				)))

				const failed = res.reduce((arr, val, i) => {
					if (val.status === 'rejected') arr.push(saveLocations[i])
					return arr
				}, [])

				if (saveLocations.length === failed.length) {
					throw new Error(`An error occurred while attempting to save ${saveName} to each selected dir.`)
				} else if (failed.length) {
					throw new Error(`An error occurred while attempting to save ${saveName} to the following selected directories: ${failed.join(', ')}.`)
				}

				win.webContents.send(`renderComplete_${id}`)
				resolve()
			} catch (err) {
				reject(err)
			} finally {
				removeJob(id)
			}
		})
		.on('error', err => {
			removeJob(id)

			if (err.toString() === 'Error: ffmpeg was killed with signal SIGKILL') {
				// Means error is from manual cancellation. Expected behavior. Do not log.
				reject(new Error('CANCELLED'))
			} else {
				console.error(err)
				reject(new Error(`An occurred while rendering ${saveName}.`))
			}
		})

	if (mediaType === 'video' || mediaType === 'audio') {
		if (start >= end) reject(new RangeError('End timecode preceeds start timecode.'))
		if (start >= totalFrames) reject(new RangeError('Start timecode exceeds duration.'))
		if (end === 0) reject(new RangeError('End timecode is set to zero. Media has no duration.'))
	
		if (start > 0) renderCmd.seekInput(start / fps)
		if (end < Math.floor(totalFrames)) renderCmd.duration((end - start) / fps)
	}

	if (!isAudio) {
		if (!isStill) {
			if (mediaType === 'video' && audioVideoTracks === 'video') renderCmd.noAudio()
			if (mediaType === 'image') renderCmd.loop(getBgDuration(background))
	
			if (renderFrameRate === 'custom') {
				renderCmd.outputOption(`-r ${exportData.customFrameRate}`)
			} else if (renderFrameRate !== 'auto') {
				renderCmd.outputOption(`-r ${renderFrameRate}`)
			} else if (exportData.acquisitionType === 'screen_record') {
				renderCmd.outputOption(`-r ${fps}`)
			}
		}
	
		if (sourceData) {
			const sourcePng = path.join(scratchDisk.imports.path, `${id}.src-overlay.png`)

			try {
				fs.writeFileSync(sourcePng, sourceData.base64, { encoding: 'base64' })		
			} catch (err) {
				console.error(err)
				reject(new Error('An error occurred while attempting to create source overlay.'))
			}

			renderCmd.input(sourcePng)
		}

		const fillNeedsBg = arc === 'fill' && (hasAlpha || overlay !== 'none' || exportData.keying.enabled || sourceData?.is11pm)
		const addBgLayer = arc === 'fit' || arc === 'transform' || fillNeedsBg

		if (addBgLayer && (background === 'alpha' || background === 'color')) {
			renderCmd
				.input(`color=c=${exportData.bgColor}@${needsAlpha ? 0 : 1}.0:s=${renderWidth}x${renderHeight}:rate=59.94${needsAlpha ? ',format=rgba' : ''}`)
				.inputOption('-f lavfi')
		} else if (addBgLayer) {
			renderCmd
				.input(path.join(assetsPath, renderHeight, `${background}.${backgroundMotion === 'still' ? 'png' : 'mp4'}`))
				.inputOption('-stream_loop -1')
		}

		if (arc !== 'none' && overlay !== 'none') {
			renderCmd
				.input(path.join(assetsPath, renderHeight, `${overlay}.png`))
				.input(`color=c=black:size=${renderWidth}x${renderHeight}:rate=59.94`)
				.inputOption('-f lavfi')

			overlayDim = getOverlayInnerDimensions(renderHeight, overlay)
		}

		renderCmd.complexFilter(filter[arc]({
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
			scale: exportData.scale,
			crop: exportData.crop,
			rotation: exportData.rotation,
			keying: exportData.keying,
			colorCurves: exportData.colorCurves
		}))
	} else if (audioExportFormat === 'bars') {
		renderCmd
			.input(`smptehdbars=size=${renderWidth}x${renderHeight}:rate=59.94`)
			.inputOption('-f lavfi')

		if (mediaType === 'video') {
			renderCmd.complexFilter(filter.videoToBars({ renderWidth, renderHeight }))
		}
	}
	
	renderCmd.run()

	renderJobs.set(id, renderCmd)

	win.webContents.send(`renderStarted_${id}`)
})
