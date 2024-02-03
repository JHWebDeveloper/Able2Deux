import path from 'path'
import fs, { promises as fsp } from 'fs'

import { ffmpeg } from '../binaries'
import { scratchDisk } from '../scratchDisk'

import { ASSETS_PATH } from '../constants'
import { getIntegerLength } from '../utilities'

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
const checkNeedsAlpha = ({ mediaType, arc, background, hasAlpha }) => (
	mediaType !== 'audio' && background === 'alpha' && arc !== 'none' && !(arc === 'fill' && !hasAlpha)
)

const checkIsStill = exportData => {
	if (exportData.mediaType !== 'image' || !exportData.autoPNG) return false

	const { arc, backgroundMotion, background, hasAlpha, aspectRatio } = exportData

	return (
		arc === 'none' ||
		backgroundMotion === 'still' ||
		background === 'color' ||
		background === 'alpha' ||
		!hasAlpha && (arc === 'fill' || arc === 'fit' && aspectRatio === '16:9')
	)
}

const getBgDuration = background => {
	switch (background) {
		case 'light_blue':
		case 'dark_blue':
		case 'teal':
		case 'tan':
			return 6.967
		default:
			return 30
	}
}

const copyFileNoOverwrite = async (src, dir, n = 0) => {
	if (n > 0) {
		const extIndex = dir.lastIndexOf('.')
		const maxLength = 250 - getIntegerLength(n)
		let truncate = 0

		if (extIndex > maxLength) truncate += extIndex - maxLength

		dir = `${dir.slice(0, extIndex - truncate)} ${n}${dir.slice(extIndex)}`
	}

	try {
		await fsp.copyFile(src, dir, fs.constants.COPYFILE_EXCL)
	} catch (err) {
		if (err.toString().startsWith('Error: EEXIST: file already exists')) {
			return copyFileNoOverwrite(src, dir, n + 1)
		} else {
			throw err
		}
	}

	return dir
}

const sharedVideoOptions = [
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
		sourceData,
		renderOutput,
		renderFrameRate,
		directories
	} = exportData

	const [ renderWidth, renderHeight ] = renderOutput.split('x')

	const isAudio = checkIsAudio(exportData)
	const isStill = checkIsStill(exportData)
	const needsAlpha = checkNeedsAlpha(exportData)

	let outputOptions = []
	let extension = ''

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
			`-pix_fmt rgb${background === 'alpha' ? 'a' : '24'}`
		]

		extension = 'png'
	} else if (needsAlpha) {
		outputOptions = [
			'-c:v prores_ks',
			'-pix_fmt yuva444p10le',
			'-profile:v 4444',
			'-vendor apl0',
			'-qscale:v 11',
			'-f mov',
			...sharedVideoOptions
		]

		extension = 'mov'
	} else {
		outputOptions = [
			`-preset:v ${exportData.h264Preset}`,
			'-c:v libx264',
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
				const saveStatus = await Promise.allSettled(directories.map(dir => (
					copyFileNoOverwrite(exportPath, path.join(dir, saveName))
				)))

				const [ rejected, fulfilled ] = saveStatus.reduce((acc, result, i) => {
					if (result.status === 'rejected') {
						acc[0].push(directories[i])
					} else if (result.status === 'fulfilled') {
						acc[1].push(result.value)
					}

					return acc
				}, [[], []])

				if (directories.length === rejected.length) {
					throw new Error(`An error occurred while attempting to save ${saveName} to each selected dir.`)
				} else if (rejected.length) {
					throw new Error(`An error occurred while attempting to save ${saveName} to the following selected directories: ${rejected.join(', ')}.`)
				}

				win.webContents.send(`renderComplete_${id}`, fulfilled)
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

		const fillNeedsBg = arc === 'fill' && (hasAlpha || exportData.keyingEnabled)
		const addBgLayer = arc === 'fit' || arc === 'transform' || fillNeedsBg

		if (addBgLayer && (background === 'alpha' || background === 'color')) {
			renderCmd
				.input(`color=c=${exportData.bgColor}@${needsAlpha ? 0 : 1}.0:s=${renderWidth}x${renderHeight}:rate=59.94${needsAlpha ? ',format=rgba' : ''}`)
				.inputOption('-f lavfi')
		} else if (addBgLayer) {
			renderCmd
				.input(path.join(ASSETS_PATH, renderHeight, `${background}.${backgroundMotion === 'still' ? 'png' : 'mp4'}`))
				.inputOption('-stream_loop -1')
		}

		renderCmd.complexFilter(filter[arc]({
			renderHeight,
			renderWidth,
			hasAlpha,
			sourceData,
			width: exportData.width,
			height: exportData.height,
			centering: exportData.centering,
			position: {
				x: exportData.positionX,
				y: exportData.positionY
			},
			scale: {
				x: exportData.scaleX,
				y: exportData.scaleY
			},
			crop: {
				t: exportData.cropT,
				r: exportData.cropR,
				b: exportData.cropB,
				l: exportData.cropL
			},
			rotation: {
				transpose: exportData.transpose,
				reflect: exportData.reflect,
				freeRotateMode: exportData.freeRotateMode,
				angle: exportData.angle,
				center: exportData.rotatedCentering
			},
			keying: {
				blend: exportData.keyingBlend,
				color: exportData.keyingColor,
				enabled: exportData.keyingEnabled,
				hidden: exportData.keyingHidden,
				similarity: exportData.keyingSimilarity,
				softness: exportData.keyingSoftness,
				threshold: exportData.keyingThreshold,
				tolerance: exportData.keyingTolerance,
				type: exportData.keyingType
			},
			colorCurves: {
				enabled: exportData.ccEnabled,
				hidden: exportData.ccHidden,
				selectedCurve: exportData.ccSelectedCurve,
				rgb: exportData.ccRGB,
				r: exportData.ccR,
				g: exportData.ccG,
				b: exportData.ccB
			}
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
