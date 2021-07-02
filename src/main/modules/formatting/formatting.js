import path from 'path'
import fs, { promises as fsp } from 'fs'
import log from 'electron-log'

import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'
import { assetsPath, getOverlayInnerDimensions } from '../utilities'
import * as filter from './filters'

log.catchErrors({ showDialog: false })

if (process.env.NODE_ENV !== 'development') console.error = log.error

const renderJobs = new Map()

export const cancelRender = id => renderJobs.get(id)?.kill()

const removeJob = id => {
	if (id) {
		renderJobs.delete(id)
	} else {
		renderJobs.clear()
	}

	return scratchDisk.exports.clear(id)
}

// eslint-disable-next-line no-extra-parens
const checkIsAudio = ({ mediaType, audio }) => (
	mediaType === 'audio' || mediaType === 'video' && audio.exportAs === 'audio'
)

// eslint-disable-next-line no-extra-parens
const checkNeedsAlpha = ({ mediaType, arc, background, overlay, hasAlpha }) => (
	mediaType !== 'audio' && background === 'alpha' && arc !== 'none' && !(arc === 'fill' && overlay === 'none' && !hasAlpha)
)

const checkIsStill = exportData => {
	if (exportData.mediaType !== 'image' || !exportData.autoPNG) return false

	const { arc, background, overlay, hasAlpha, aspectRatio } = exportData

	let isStill = false

	isStill ||= arc === 'none'
	isStill ||= background === 'color' || background === 'alpha'
	isStill ||= overlay === 'none' && (!hasAlpha && (arc === 'fill' || arc === 'fit' && aspectRatio === '16:9'))

	return isStill
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
		audio,
		arc,
		background,
		overlay,
		sourceData,
		rotation,
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
			'-crf 18',
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
				const res = await Promise.allSettled(saveLocations.map(({ directory }) => (
					copyFileNoOverwrite(exportPath, path.join(directory, saveName))
				)))

				const failed = res.reduce((arr, val, i) => {
					if (val.status === 'rejected') arr.push(saveLocations[i].directory)
					return arr
				}, [])

				if (failed.length === saveLocations.length) {
					throw new Error(`An error occurred when attempting to save ${saveName} to each selected directory.`)
				} else if (failed.length) {
					throw new Error(`An error occurred when attempting to save ${saveName} to the following selected directories: ${failed.join(', ')}`)
				}

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
			} catch (cancelErr) {
				console.error(cancelErr)
			} finally {
				removeJob(id)

				if (err.toString() === 'Error: ffmpeg was killed with signal SIGKILL') {
					reject(new Error('CANCELLED'))
				} else {
					console.error(err)
					reject(new Error(`An occurred while rendering ${saveName}.`))
				}
			}
		})

	if (mediaType === 'video' || mediaType === 'audio') {
		if (end <= start) reject(new RangeError('End timecode preceeds start timecode.'))
		if (start >= totalFrames) reject(new RangeError('Start timecode exceeds duration.'))
		if (end === 0) reject(new RangeError('End timecode is set to zero. Media has no duration.'))
	
		if (start > 0) renderCmd.seekInput(start / fps)
		if (end < Math.floor(totalFrames)) renderCmd.duration((end - start) / fps)
	}

	if (!isAudio) {
		if (!isStill) {
			if (mediaType === 'video' && audio.exportAs === 'video') renderCmd.noAudio()
			if (mediaType === 'image') renderCmd.loop(7)
	
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
				fs.writeFileSync(sourcePng, sourceData, { encoding: 'base64' })		
			} catch (err) {
				console.error(err)
				reject(new Error('An error occurred when attempting to create source overlay.'))
			}

			renderCmd.input(sourcePng)
		}

		if (arc !== 'none' && !(arc === 'fill' && overlay === 'none' && !hasAlpha)) {
			if (background === 'blue' || background === 'grey') {
				renderCmd
					.input(path.join(assetsPath, renderHeight, `${background}.mov`))
					.inputOption('-stream_loop -1')
			} else {
				renderCmd
					.input(`color=c=${exportData.bgColor}@${needsAlpha ? 0 : 1}.0:s=${renderWidth}x${renderHeight}:rate=59.94${needsAlpha ? ',format=rgba' : ''}`)
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
