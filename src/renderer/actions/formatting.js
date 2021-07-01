import { v1 as uuid } from 'uuid'
import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from 'status'
import { updateMediaState, addMedia } from '.'
import { createMediaData } from 'utilities'

import {
	createPromiseQueue,
	buildSource,
	getIntegerLength,
	zeroize,
	cleanFilename,
	replaceTokens,
	toastrOpts
} from '../utilities'

const { interop } = window.ABLE2

// ---- MEDIA MANAGER --------

export const selectMedia = id => ({
	type: ACTION.UPDATE_STATE,
	payload: { selectedId: id }
})

export const mergeSettings = (id, properties) => ({
	type: ACTION.UPDATE_MEDIA_STATE,
	payload: { id, properties }
})

export const copySettings = settings => ({
	type: ACTION.UPDATE_STATE,
	payload: {
		copiedSettings: { ...settings }
	}
})

export const pasteSettings = id => ({
	type: ACTION.PASTE_SETTINGS,
	payload: { id }
})

export const moveMedia = (oldPos, newPos) => ({
	type: ACTION.MOVE_MEDIA,
	payload: { oldPos, newPos }
})

export const duplicateMedia = id => ({
	type: ACTION.DUPLICATE_MEDIA,
	payload: {
		id,
		newId: uuid()
	}
})

export const splitMedia = (id, split, start, end) => async dispatch => {
	const ammount = Math.ceil((end - start) / split)

	if (ammount > 50) {
		const { response } = await interop.warning({
			message: 'That\'s a lot of subclips!',
			detail: `The current split duration will result in ${ammount} subclips. Large ammounts of media may cause Able2 to run slow. Make sure your split duration follows an HH:MM:SS format. Proceed?`
		})

		if (response) return false  
	}

	const duplicates = []
	const len = end - split
	let i = start

	while (i < len) duplicates.push({
		newId: uuid(),
		changes: {
			start: i,
			end: i += split
		}
	})

	dispatch({
		type: ACTION.SPLIT_MEDIA,
		payload: { id, duplicates }
	})

	dispatch(updateMediaState(id, { start: i }))
}

export const applySettingsToAll = (id, properties) => ({
	type: ACTION.APPLY_TO_ALL,
	payload: { id, properties }
})

export const toggleSaveLocation = id => ({
	type: ACTION.TOGGLE_SAVE_LOCATION,
	payload: { id }
})


// ---- EXTRACT STILL --------

export const extractStill = (sourceMediaData, e) => async dispatch => {
	const { hasAlpha, filename, width, height, aspectRatio } = sourceMediaData
	let stillData = {}

	try {
		stillData = await interop.copyPreviewToImports({
			oldId: sourceMediaData.id,
			hasAlpha
		})
	} catch (err) {
		return toastr.error('Unable to extract still', false, toastrOpts)
	}

	const inheritance = e.shiftKey ? {
		filename,
		width,
		height,
		aspectRatio,
		hasAlpha
	} : sourceMediaData

	const mediaData = createMediaData({
		...inheritance,
		...stillData,
		title: `Screengrab ${sourceMediaData.title}`,
		mediaType: 'image',
		acquisitionType: 'screengrab',
		duration: 0,
		fps: 0
	})

	dispatch(addMedia(mediaData))
}


// ---- RENDER --------

const updateRenderStatus = (id, status) => ({
	type: ACTION.UPDATE_MEDIA_NESTED_STATE,
	payload: {
		id,
		nest: 'render',
		properties: { status }
	}
})

const updateRenderProgress = ({ id, percent }) => ({
	type: ACTION.UPDATE_MEDIA_NESTED_STATE,
	payload: {
		id,
		nest: 'render',
		properties: { percent }
	}
})

const renderQueue = createPromiseQueue()

const fillMissingFilenames = media => media.map(item => ({
	...item,
	filename: item.filename || 'Able2 Export $t $d'
}))

const getBatchNamer = batch => {
	switch (batch.position) {
		case 'replace':
			return () => batch.name
		case 'prepend':
			return filename => `${batch.name.trim()} ${filename}`
		case 'append':
			return filename => `${filename} ${batch.name.trim()}`
		default:
			return filename => filename
	}
}

const applyBatchName = (media, batch) => {
	if (!batch.name || media.length < 2) return media

	const batchNamer = getBatchNamer(batch)

	return media.map(item => ({
		...item,
		filename: batchNamer(item.filename)
	}))
}

const sanitizeFilenames = (media, asperaSafe) => media.map((item, i) => ({
	...item,
	filename: cleanFilename(replaceTokens(item.filename, i, media.length), asperaSafe)
}))

const preventDuplicateFilenames = media => {
	if (media.length < 2) return media

	const tally = new Map()
	const { length } = media
	let i = 0

	do {
		const key = media[i].filename

		if (tally.has(key)) {
			tally.get(key).count++
			tally.get(key).total++
		} else {
			tally.set(key, { count: 1, total: 1 })
		}
	} while (++i < length)

	if (tally.size === length) return media

	const mediaCopy = [...media]

	while (i--) {
		const key = mediaCopy[i].filename
		const { count, total } = tally.get(key)

		if (total === 1) continue

		// make sure there are enough available characters to concatenate number count
		const totalLength = getIntegerLength(total)
		const maxFilenameLength = 246 - totalLength * 2

		if (key.length > maxFilenameLength) {
			mediaCopy[i].filename = key.slice(0, maxFilenameLength)
		}

		mediaCopy[i].filename = `${key} ${zeroize(count, totalLength)} of ${total}`

		tally.get(key).count--
	}

	return mediaCopy
}

const renderItem = (params, dispatch) => {
	const { saveLocations, renderOutput, renderFrameRate, customFrameRate, autoPNG } = params

	return async item => {
		const { id, arc, aspectRatio, source, filename } = item

		if (item.source.sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			item.sourceData = buildSource(source, renderOutput)
		}
	
		try {
			await interop.requestRenderChannel({
				data: {
					...item,
					renderOutput,
					renderFrameRate,
					customFrameRate,
					autoPNG,
					saveLocations
				},
				startCallback() {
					dispatch(updateRenderStatus(id, STATUS.RENDERING))
				},
				progressCallback(data) {
					dispatch(updateRenderProgress(data))
				}
			})
	
			dispatch(updateRenderStatus(id, STATUS.COMPLETE))
		} catch (err) {
			const errStr = err.toString()

			if (errStr === 'Error: ffmpeg was killed with signal SIGKILL') {
				dispatch(updateRenderStatus(id, STATUS.CANCELLED))
			} else {
				dispatch(updateRenderStatus(id, STATUS.FAILED))

				let errMsg = ''

				if (/^Error: Unable to save /.test(errStr)) {
					errMsg = errStr
				} else if (/^RangeError: /.test(errStr)) {
					errMsg = `Failed to render ${filename}. ${errStr.replace(/^RangeError: /, '')}`
				} else {
					errMsg = `Failed to render ${filename}`
				}
	
				toastr.error(errMsg, false, toastrOpts)
			}
		}
	}
}

export const render = params => async dispatch => {
	let { media, saveLocations, batch, goBack, removeLocation } = params

	saveLocations = saveLocations.filter(({ checked }) => checked)

	// Check for non-existent directories and prompt to abort render if found

	for await (const location of saveLocations) {
		const exists = await interop.checkIfDirectoryExists(location.directory)

		if (exists) continue

		dispatch(toggleSaveLocation(location.id))

		const { response, checkboxChecked } = await interop.directoryNotFoundAlert(location.directory)

		if (response > 0) return !goBack()

		if (checkboxChecked) removeLocation(location.id)

		saveLocations = saveLocations.filter(({ id }) => id !== location.id)
	}

	// Prompt to choose a directory if no directories are selected or available

	if (!saveLocations.length) {
		const { filePaths, canceled } = await interop.chooseDirectory()

		if (canceled) return !goBack()

		saveLocations.push({
			directory: filePaths[0]
		})
	}

	// prepare filenames

	media = fillMissingFilenames(media)
	media = applyBatchName(media, batch)
	media = sanitizeFilenames(media, params.asperaSafe)
	media = preventDuplicateFilenames(media)

	for (const item of media) {
		dispatch(updateMediaState(item.id, {
			exportFilename: item.filename
		}))
	}

	// add to promise queue and begin render

	const renderItemReady = renderItem({
		saveLocations,
		renderOutput: params.renderOutput,
		renderFrameRate: params.renderFrameRate,
		customFrameRate: params.customFrameRate,
		autoPNG: params.autoPNG
	}, dispatch)

	for (const item of media) {
		renderQueue.add(item.id, () => renderItemReady(item))
	}

	renderQueue
		.updateConcurrent(params.concurrent)
		.start()
}

export const cancelRender = (id, status) => async dispatch => {
	if (status === STATUS.COMPLETE) return false

	if (status === STATUS.RENDERING) return interop.cancelRender(id)
	if (status === STATUS.PENDING) renderQueue.remove(id)

	dispatch(updateRenderStatus(id, STATUS.CANCELLED))
}

export const startOver = () => dispatch => {
	dispatch({ type: ACTION.START_OVER })
	interop.clearTempFiles()
}
