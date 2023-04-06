import { v1 as uuid } from 'uuid'
import toastr from 'toastr'

import * as ACTION from 'actions/types'
import * as STATUS from 'status'

import {
	addMedia,
	updateMediaNestedState,
	updateMediaState
} from 'actions'

import {
	buildSource,
	clamp,
	cleanFilename,
	createMediaData,
	createCurvePoint,
	createDefaultCurvePoints,
	createPromiseQueue,
	errorToString,
	getIntegerLength,
	pipe,
	replaceTokens,
	toastrOpts,
	zeroize
} from 'utilities'

const { interop } = window.ABLE2

// ---- MEDIA SELECTOR --------

export const selectMedia = id => ({
	type: ACTION.UPDATE_STATE,
	payload: { selectedId: id }
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

export const applySettingsToAll = (id, properties) => ({
	type: ACTION.APPLY_TO_ALL,
	payload: { id, properties }
})

export const duplicateMedia = id => ({
	type: ACTION.DUPLICATE_MEDIA,
	payload: {
		id,
		newId: uuid()
	}
})

// ---- EDITOR --------

export const toggleAspectRatioMarker = id => ({
	type: ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX,
	payload: {
		property: 'selected',
		nest: 'aspectRatioMarkers',
		id 
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
			timecode: i,
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

export const addCurvePoint = (id, curveName, pointData, editAll) => ({
	type: ACTION.ADD_CURVE_POINT,
	payload: {
		id,
		curveName,
		pointData,
		editAll
	}
})

export const addOrUpdateCurvePoint = (id, curveName, pointData, editAll) => ({
	type: ACTION.ADD_OR_UPDATE_CURVE_POINT,
	payload: {
		id,
		curveName,
		pointData,
		editAll
	}
})

export const deleteCurvePoint = (id, curveName, pointId, editAll) => ({
	type: ACTION.DELETE_CURVE_POINT,
	payload: {
		id,
		curveName,
		pointId,
		editAll
	}
})

export const resetCurve = (id, curveName, editAll) => ({
	type: ACTION.RESET_CURVE,
	payload: {
		id,
		curveName,
		pointData: createDefaultCurvePoints(),
		editAll
	}
})

const createWhiteBalancedCurve = (b, w) => {
	w.x = clamp(w.x, 6, 256)

	if (w.x < b.x) b.x = w.x - 6

	return [b, w]
}

const createBlackBalancedCurve = (b, w) => {
	b.x = clamp(b.x, 0, 250)

	if (b.x > w.x) w.x = b.x + 6

	return [b, w]
}

export const colorBalance = (id, eyedropper, colorCurves, editAll) => dispatch => {
	const { active, pixelData } = eyedropper
	let r = []
	let g = []
	let b = []

	if (active === 'white') {
		r = createWhiteBalancedCurve(colorCurves.r[0], createCurvePoint(pixelData.r, 0, true))
		g = createWhiteBalancedCurve(colorCurves.g[0], createCurvePoint(pixelData.g, 0, true))
		b = createWhiteBalancedCurve(colorCurves.b[0], createCurvePoint(pixelData.b, 0, true))
	} else {
		r = createBlackBalancedCurve(createCurvePoint(pixelData.r, 256, true), colorCurves.r.at(-1))
		g = createBlackBalancedCurve(createCurvePoint(pixelData.g, 256, true), colorCurves.g.at(-1))
		b = createBlackBalancedCurve(createCurvePoint(pixelData.b, 256, true), colorCurves.b.at(-1))
	}

	dispatch(updateMediaNestedState(id, 'colorCurves', {
		hidden: false,
		rgb: createDefaultCurvePoints(),
		r,
		g,
		b
	}, editAll))
}

export const cleanupCurve = (id, curveName, editAll) => ({
	type: ACTION.CLEANUP_CURVE,
	payload: { id, curveName, editAll }
})

export const toggleSaveLocation = (id, property) => ({
	type: ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX,
	payload: {
		nest: 'saveLocations',
		property,
		id
	}
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
		return toastr.error(errorToString(err), false, toastrOpts)
	}

	const inheritance = e.shiftKey ? {
		filename,
		width,
		height,
		aspectRatio,
		hasAlpha
	} : sourceMediaData

	const mediaData = await createMediaData({
		...inheritance,
		...stillData,
		title: `Screengrab ${sourceMediaData.title}`,
		mediaType: 'image',
		acquisitionType: 'screengrab',
		duration: 0,
		fps: 0,
		hasAudio: false
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

const applyBatchName = batch => {
	if (!batch.name) return val => val

	const batchNamer = getBatchNamer(batch)

	return media => {
		if (media.length < 2) return media

		return media.map(item => ({
			...item,
			filename: batchNamer(item.filename)
		}))
	}
}

const sanitizeFilenames = asperaSafe => media => media.map((item, i) => ({
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

const renderItem = (args, dispatch) => {
	const { saveLocations, renderOutput, renderFrameRate, customFrameRate, autoPNG } = args

	return async item => {
		const { id, arc, aspectRatio, source } = item

		if (item.source.sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			item.sourceData = buildSource(source, renderOutput, item.background)
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
			const errStr = errorToString(err)

			if (errStr === 'CANCELLED') {
				dispatch(updateRenderStatus(id, STATUS.CANCELLED))
			} else {
				dispatch(updateRenderStatus(id, STATUS.FAILED))
				toastr.error(errStr, false, toastrOpts)
			}
		}
	}
}

export const render = args => async dispatch => {
	const { batch, goBack, removeLocation } = args
	let { media, saveLocations } = args

	saveLocations = saveLocations.filter(({ hidden, checked }) => !hidden && checked)

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

	/*
		If save locations are selected or available, promote key directory to top level and remove duplicates.
		If not, prompt to choose a directory
	*/

	if (saveLocations.length) {
		saveLocations = [...new Set(saveLocations.map(({ directory }) => directory))]
	} else {
		const { filePaths, canceled } = await interop.chooseDirectory()

		if (canceled) return !goBack()

		saveLocations.push(filePaths[0])
	}

	// prepare filenames

	media = pipe(
		fillMissingFilenames,
		applyBatchName(batch),
		sanitizeFilenames(args.asperaSafe),
		preventDuplicateFilenames
	)(media)

	for (const item of media) {
		dispatch(updateMediaState(item.id, {
			exportFilename: item.filename
		}))
	}

	// add to promise queue and begin render

	const renderItemReady = renderItem({
		saveLocations,
		renderOutput: args.renderOutput,
		renderFrameRate: args.renderFrameRate,
		customFrameRate: args.customFrameRate,
		autoPNG: args.autoPNG
	}, dispatch)

	for (const item of media) {
		renderQueue.add(item.id, () => renderItemReady(item))
	}

	renderQueue
		.updateConcurrent(args.concurrent)
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
