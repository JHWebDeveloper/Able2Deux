import toastr from 'toastr'

import * as ACTION from 'actions/types'
import * as STATUS from 'status'

import {
	addMedia,
	updateMediaStateById,
	updateMediaStateBySelection
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
	pipeAsync,
	refocusBatchItem,
	replaceTokens,
	toastrOpts,
	zeroize
} from 'utilities'

const { interop } = window.ABLE2

// ---- SELECT MEDIA --------

export const selectMedia = (clickedIndex, e = {}, selectionData = {}) => dispatch => {
	const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

	dispatch({
		type: ACTION.SELECT_MEDIA,
		payload: {
			clickedIndex,
			clickedInFocus: selectionData.focused,
			clickedIsAnchored: selectionData.anchored,
			clickedInSelection: selectionData.selected,
			shift: e.shiftKey,
			ctrlOrCmd
		}
	})

	if (ctrlOrCmd) refocusBatchItem()
}

export const selectAllMedia = focusIndex => ({
	type: ACTION.SELECT_ALL_MEDIA,
	payload: { focusIndex }
})

export const deselectAllMedia = () => ({
	type: ACTION.DESELECT_ALL_MEDIA
})

// ---- SORT MEDIA --------

export const moveSelectedMedia = index => ({
	type: ACTION.MOVE_SELECTED_MEDIA,
	payload: { index }
})

// ---- DUPLICATE MEDIA --------

export const duplicateMedia = index => ({
	type: ACTION.DUPLICATE_MEDIA,
	payload: { index }
})

export const duplicateSelectedMedia = () => ({
	type: ACTION.DUPLICATE_SELECTED_MEDIA
})

export const splitMedia = (id, split, start, end) => async dispatch => {
	const amount = Math.ceil((end - start) / split)

	if (amount > 50) {
		const { response } = await interop.warning({
			message: 'That\'s a lot of subclips!',
			detail: `The current split duration will result in ${amount} subclips. Large amounts of media may cause Able2 to run slow. Make sure your split duration follows an HH:MM:SS format. Proceed?`
		})

		if (response) return false  
	}

	const timecodes = []
	const len = end - split
	let i = start

	while (i < len) timecodes.push({
		timecode: i,
		start: i,
		end: i += split
	})

	dispatch({
		type: ACTION.SPLIT_MEDIA,
		payload: { id, timecodes }
	})

	dispatch(updateMediaStateById(id, { start: i }))
}

// ---- COPY/PASTE PROPERTIES --------

export const pasteSettings = (id, properties) => ({
	type: ACTION.PASTE_SETTINGS,
	payload: { id, properties }
})

export const applySettingsToAll = id => properties => ({
	type: ACTION.APPLY_TO_ALL,
	payload: { id, properties }
})

export const applySettingsToSelection = id => properties => ({
	type: ACTION.APPLY_TO_SELECTION,
	payload: { id, properties }
})

// ---- COLOR CORRECTION --------

export const addCurvePoint = (id, curveName, pointData) => ({
	type: ACTION.ADD_CURVE_POINT,
	payload: {
		id,
		curveName,
		pointData
	}
})

export const addOrUpdateCurvePoint = (id, curveName, pointData) => ({
	type: ACTION.ADD_OR_UPDATE_CURVE_POINT,
	payload: {
		id,
		curveName,
		pointData
	}
})

export const deleteCurvePoint = (id, curveName, pointId) => ({
	type: ACTION.DELETE_CURVE_POINT,
	payload: {
		id,
		curveName,
		pointId
	}
})

export const resetCurve = curveName => ({
	type: ACTION.RESET_CURVE,
	payload: {
		curveName,
		pointData: createDefaultCurvePoints()
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

export const colorBalance = (eyedropper, curves) => dispatch => {
	const { active, pixelData } = eyedropper
	let ccR = []
	let ccG = []
	let ccB = []

	if (active === 'white') {
		ccR = createWhiteBalancedCurve(curves.ccR[0], createCurvePoint(pixelData.r, 0, true))
		ccG = createWhiteBalancedCurve(curves.ccG[0], createCurvePoint(pixelData.g, 0, true))
		ccB = createWhiteBalancedCurve(curves.ccB[0], createCurvePoint(pixelData.b, 0, true))
	} else {
		ccR = createBlackBalancedCurve(createCurvePoint(pixelData.r, 256, true), curves.ccR.at(-1))
		ccG = createBlackBalancedCurve(createCurvePoint(pixelData.g, 256, true), curves.ccG.at(-1))
		ccB = createBlackBalancedCurve(createCurvePoint(pixelData.b, 256, true), curves.ccB.at(-1))
	}

	dispatch(updateMediaStateBySelection({
		ccHidden: false,
		ccRGB: createDefaultCurvePoints(),
		ccR,
		ccG,
		ccB
	}))
}

export const cleanupCurve = curveName => ({
	type: ACTION.CLEANUP_CURVE,
	payload: { curveName }
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

	pipeAsync(createMediaData, addMedia, dispatch)({
		...inheritance,
		...stillData,
		title: `Screengrab ${sourceMediaData.title}`,
		mediaType: 'image',
		acquisitionType: 'screengrab',
		duration: 0,
		fps: 0,
		hasAudio: false,
		focused: false,
		anchored: false,
		selected: false
	})
}

// ---- RENDER --------

const updateRenderStatus = (id, renderStatus) => updateMediaStateById(id, { renderStatus })

const updateRenderProgress = ({ id, percent: renderPercent }) => updateMediaStateById(id, { renderPercent })

const renderQueue = createPromiseQueue()

const fillMissingFilenames = media => media.map(item => ({
	...item,
	filename: item.filename || 'Able2 Export $t $d'
}))

const getBatchNamer = (batchName, batchNameType) => {
	const prepareBatchName = filename => batchName.trim().replace(/(?<!\\)\$f/g, filename.trim())

	switch (batchNameType) {
		case 'replace':
			return prepareBatchName
		case 'prepend':
			return filename => `${prepareBatchName(filename)} ${filename.trim()}`
		case 'append':
			return filename => `${filename.trim()} ${prepareBatchName(filename)}`
		default:
			return filename => filename
	}
}

const applyBatchName = (media, batchName, batchNameType) => {
	if (media.length < 2 || !batchName) return media

	const batchNamer = getBatchNamer(batchName, batchNameType)

	return media.map(item => ({
		...item,
		filename: batchNamer(item.filename)
	}))
}

const sanitizeFilenames = (media, asperaSafe) => media.map((item, i) => ({
	...item,
	filename: cleanFilename(replaceTokens(item.filename, i, media.length, item), asperaSafe)
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
		const { id, arc, aspectRatio, sourceName, sourcePrefix, sourceOnTop, background } = item

		if (sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			item.sourceData = buildSource({ sourceName, sourcePrefix, sourceOnTop, renderOutput, background })
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
	const { batchName, batchNameType, goBack, removeLocation } = args
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
		val => applyBatchName(val, batchName, batchNameType),
		val => sanitizeFilenames(val, args.asperaSafe),
		preventDuplicateFilenames
	)(media)

	for (const item of media) {
		dispatch(updateMediaStateById(item.id, {
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

export const cancelRender = (id, renderStatus) => async dispatch => {
	if (renderStatus === STATUS.COMPLETE) return false

	if (renderStatus === STATUS.RENDERING) return interop.cancelRender(id)
	if (renderStatus === STATUS.PENDING) renderQueue.remove(id)

	dispatch(updateRenderStatus(id, STATUS.CANCELLED))
}

// ---- OTHER EDITOR ACTIONS --------

export const togglePanelOpen = panelName => ({
	type: ACTION.TOGGLE_PANEL_OPEN,
	payload: { panelName }
})

export const toggleAspectRatioMarker = id => ({
	type: ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX,
	payload: {
		property: 'selected',
		nest: 'aspectRatioMarkers',
		id 
	}
})

export const toggleSaveLocation = (id, property) => ({
	type: ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX,
	payload: {
		nest: 'saveLocations',
		property,
		id
	}
})

export const startOver = () => dispatch => {
	dispatch({ type: ACTION.START_OVER })
	interop.clearTempFiles()
}
