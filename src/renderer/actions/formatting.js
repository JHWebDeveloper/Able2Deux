import { v1 as uuid } from 'uuid'
import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from '../status/types'
import { PromiseQueue } from '../constructors'
import { updateMediaNestedState, updateMediaState } from '.'
import { buildSource, countDigits, zeroize, cleanFilename, replaceTokens, toastrOpts } from '../utilities'

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

export const moveMedia = (pos, dir = 1) => ({
	type: ACTION.MOVE_MEDIA,
	payload: {
		oldPos: pos,
		newPos: pos + dir
	}
})

export const duplicateMedia = id => ({
	type: ACTION.DUPLICATE_MEDIA,
	payload: { id, newId: uuid() }
})

export const applySettingsToAll = (id, properties) => ({
	type: ACTION.APPLY_TO_ALL,
	payload: { id, properties }
})

export const toggleSaveLocation = id => ({
	type: ACTION.TOGGLE_SAVE_LOCATION,
	payload: { id }
})


// ---- SCALE --------

export const updateScale = (id, editAll, scale, e) => dispatch => {
	const value = parseFloat(e.target.value)
	const isx = e.target.name === 'x'
	const offset = (isx ? scale.y / scale.x : scale.x / scale.y) || 1

	dispatch(updateMediaNestedState(id, 'scale', {
		x: isx ? value : value * offset,
		y: isx ? value * offset : value
	}, editAll))
}

export const fitToFrameWidth = (id, editAll, scale, frameWidthPrc) => dispatch => {
	dispatch(updateMediaNestedState(id, 'scale', {
		x: frameWidthPrc,
		y: scale.link ? frameWidthPrc : scale.y
	}, editAll))
}

export const fitToFrameHeight = (id, editAll, scale, frameHeightPrc) => dispatch => {
	dispatch(updateMediaNestedState(id, 'scale', {
		x: scale.link ? frameHeightPrc : scale.x,
		y: frameHeightPrc
	}, editAll))
}


// ---- CROP --------

export const updateCropBiDirectional = (id, editAll, d1, d2, e) => dispatch => {
	const value = parseFloat(e.target.value)

	dispatch(updateMediaNestedState(id, 'crop', {
		[d1]: value,
		[d2]: value
	}, editAll))
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

let renderQueue = false

const fillMissingFilenames = media => media.map(item => ({
	...item,
	filename: item.filename || 'Able2 Export $t $d'
}))

const getRenamer = batch => {
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

	const renamer = getRenamer(batch)

	return media.map(item => ({
		...item,
		filename: renamer(item.filename)
	}))
}

const sanitizeFilenames = (media, asperaSafe) => media.map((item, i) => ({
	...item,
	filename: cleanFilename(replaceTokens(item.filename, i, media.length), asperaSafe)
}))

const preventDuplicateFilenames = media => {
	if (media.length < 2) return media

	const tally = new Map()
	const mediaCopy = [...media]
	const { length } = mediaCopy
	let i = 0

	while (i < length) {
		const key = mediaCopy[i].filename
		i++

		if (tally.has(key)) {
			tally.get(key).count += 1
			tally.get(key).total += 1
		} else {
			tally.set(key, { count: 1, total: 1 })
		}
	}

	if (tally.size === length) return mediaCopy

	const maxFilenameLength = 251 - (countDigits(length) * 2 + 5)

	while (i--) {
		const key = mediaCopy[i].filename
		const { count, total } = tally.get(key)

		if (total === 1) continue

		// make sure there are enough available characters to concatenate number count
		if (key.length > maxFilenameLength) {
			mediaCopy[i].filename = key.slice(0, maxFilenameLength)
		}

		mediaCopy[i].filename += ` ${zeroize(count, total)} of ${total}`

		tally.get(key).count -= 1
	}

	return mediaCopy
}

const renderItem = async (item, params, dispatch) => {
	const { id, arc, aspectRatio, source, filename } = item
	const { renderOutput, renderFrameRate, autoPNG } = params

	if (item.source.sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
		item.sourceData = buildSource(source, renderOutput)
	}

	try {
		await interop.requestRenderChannel({
			data: {
				...item,
				renderOutput,
				renderFrameRate,
				autoPNG,
				saveLocations: params.saveLocations.filter(({ checked }) => checked)
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

			let errMsg = `Failed to render ${filename}`

			if (/^Error: Start timecode/.test(err)) errMsg += '. Start timecode exceeds duration.'
			if (/^Error: End timecode/.test(err)) errMsg += '. End timecode preceeds start timecode.'

			toastr.error(errMsg, false, toastrOpts)
		}
	}
}

export const render = params => async dispatch => {
	let { media, saveLocations, batch, goBack } = params

	// Uncheck non existent directories and prompt to abort render if found

	for await (const location of saveLocations) {
		if (!location.checked) continue

		const exists = await interop.checkIfDirectoryExists(location.directory)

		if (exists) continue

		dispatch(toggleSaveLocation(location.id))

		if (await interop.directoryNotFoundAlert(location.directory)) {
			return !goBack()
		} else {
			location.checked = false
		}
	}

	// Prompt to choose a directory if no directories are selected or available

	if (saveLocations.every(({ checked }) => !checked)) {
		const { filePaths, canceled } = await interop.chooseDirectory()

		if (canceled) return !goBack()

		const tempDir = {
			checked: true,
			label: 'Temporary',
			directory: filePaths[0]
		}

		params = {
			...params,
			saveLocations: [	...saveLocations, tempDir ]
		}
	}

	// prepare filenames

	media = fillMissingFilenames(media)
	media = applyBatchName(media, batch)
	media = sanitizeFilenames(media, params.asperaSafe)
	media = preventDuplicateFilenames(media)

	media.forEach(async item => {
		dispatch(updateMediaState(item.id, {
			exportFilename: item.filename
		}))
	})

	// Create promise queue and begin rendering

	renderQueue = new PromiseQueue(params.concurrent)

	for (const item of media) {
		renderQueue.add(item.id, () => renderItem(item, params, dispatch))
	}

	renderQueue.start()
}

export const cancelRender = (id, status) => async dispatch => {
	if (status === STATUS.COMPLETE) return false

	dispatch(updateRenderStatus(id, STATUS.CANCELLING))

	if (status === STATUS.RENDERING) return interop.cancelRender(id)
	if (status === STATUS.PENDING) renderQueue.remove(id)

	dispatch(updateRenderStatus(id, STATUS.CANCELLED))
}

export const startOver = () => dispatch => {
	dispatch({ type: ACTION.START_OVER })
	interop.clearTempFiles()
}
