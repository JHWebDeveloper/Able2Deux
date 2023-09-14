import toastr from 'toastr'

import * as ACTION from 'actions/types'
import * as STATUS from 'status'

import {
	addMedia,
	updateMediaStateById,
	updateMediaStateBySelection
} from 'actions'

import {
	TOASTR_OPTIONS,
	buildSource,
	clamp,
	cleanFilename,
	createMediaData,
	createCurvePoint,
	createDefaultCurvePoints,
	createPromiseQueue,
	errorToString,
	getIntegerLength,
	createObjectPicker,
	pipe,
	pipeAsync,
	refocusBatchItem,
	replaceTokens,
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

export const selectDuplicates = (refId, index) => ({
	type: ACTION.SELECT_DUPLICATES,
	payload: { refId, index }
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

export const duplicateSelectedMedia = duplicateAll => ({
	type: ACTION.DUPLICATE_SELECTED_MEDIA,
	payload: { duplicateAll }
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

export const copyAttributes = (id, ...extractors) => ({
	type: ACTION.COPY_ATTRIBUTES,
	payload: {
		id,
		extractAttributes: attributes => pipe(...extractors)(attributes)
	}
})

export const pasteAttributes = id => ({
	type: ACTION.PASTE_ATTRIBUTES,
	payload: { id }
})

export const applyToAll = (id, ...extractors) => ({
	type: ACTION.APPLY_TO_ALL,
	payload: {
		id,
		extractAttributes: attributes => pipe(...extractors)(attributes)
	}
})

export const applyToSelection = (id, ...extractors) => ({
	type: ACTION.APPLY_TO_SELECTION,
	payload: {
		id,
		extractAttributes: attributes => pipe(...extractors)(attributes)
	}
})

// ---- APPLY/SAVE PRESETS --------

export const applyPreset = (presetIds, mediaIds, duplicate) => async dispatch => {
	if (typeof presetIds === 'string') presetIds = [presetIds]
	if (typeof mediaIds === 'string') mediaIds = [mediaIds]

	dispatch({
		type: ACTION.APPLY_PRESET,
		payload: {
			presets: await interop.getPresets(presetIds),
			mediaIds,
			duplicate
		}
	})
}

export const applyPresetToSelected = ({ presetIds, applyToAll, duplicate }) => async dispatch => {
	if (typeof presetIds === 'string') presetIds = [presetIds]
	
	dispatch({
		type: ACTION.APPLY_PRESET_TO_SELECTED,
		payload: {
			presets: await interop.getPresets(presetIds),
			applyToAll,
			duplicate
		}
	})
}

export const saveAsPreset = (id, ...extractors) => ({
	type: ACTION.SAVE_AS_PRESET,
	payload: {
		id,
		openPresetSaveAs(attributes) {
			interop.openPresetsSaveAs(pipe(...extractors)(attributes))
		}
	}
})

// ---- REMOVE MEDIA --------

export const removeAllMedia = () => ({
	type: ACTION.REMOVE_ALL_MEDIA
})

export const removeSelectedMedia = () => ({
	type: ACTION.REMOVE_SELECTED_MEDIA
})

// ---- SCALE --------

export const fitToFrameWidth = frameW => ({
	type: ACTION.FIT_TO_FRAME_WIDTH,
	payload: { frameW }
})

export const fitToFrameHeight = frameH => ({
	type: ACTION.FIT_TO_FRAME_HEIGHT,
	payload: { frameH }
})

export const fitToFrameAuto = (sizingMethod, frameW, frameH) => ({
	type: ACTION.FIT_TO_FRAME_AUTO,
	payload: { sizingMethod, frameW, frameH }
})

// ---- ROTATION --------

export const rotateMedia = e => ({
	type: ACTION.ROTATE_MEDIA,
	payload: {
		transpose: e.target.value
	}
})

export const reflectMedia = e => ({
	type: ACTION.REFLECT_MEDIA,
	payload: {
		reflect: e.target.value
	}
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
	const { hasAlpha, filename, width, height, aspectRatio, duration, fps, timecode } = sourceMediaData
	let stillData = {}

	try {
		stillData = await interop.copyPreviewToImports({
			oldId: sourceMediaData.id,
			hasAlpha
		})
	} catch (err) {
		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}

	const inheritance = e.shiftKey ? {
		filename,
		width,
		height,
		aspectRatio,
		hasAlpha,
		duration,
		fps
	} : sourceMediaData

	pipeAsync(createMediaData, addMedia, dispatch)({
		...inheritance,
		...stillData,
		title: `Screengrab ${sourceMediaData.title}`,
		mediaType: 'image',
		acquisitionType: 'screengrab',
		start: timecode,
		end: timecode + 1,
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

const createNamingTemplate = ({ type, replacer, prepend, append }) => {
	if (type === 'replace') {
		return filename => replacer.replace(/(?<!\\)\$f/g, filename.trim())
	} else if (prepend && append) {
		return filename => `${prepend} ${filename.trim()} ${append}`
	} else if (prepend) {
		return filename => `${prepend} ${filename.trim()}`
	} else if (append) {
		return filename => `${filename.trim()} ${append}`
	} else {
		return filename => filename.trim()
	}
}

const applyPresetName = media => media.map(item => {
	if (!item.presetNamePrepend && !item.presetNameAppend) return item

	const presetNameTemplate = createNamingTemplate({
		prepend: item.presetNamePrepend?.trimStart(),
		append: item.presetNameAppend?.trimEnd()
	})

	return {
		...item,
		filename: presetNameTemplate(item.filename)
	}
})

const applyBatchName = (media, { batchNameType, batchName, batchNamePrepend, batchNameAppend }) => {
	if (
		media.length < 2 ||
		batchNameType === 'replace' && !batchName ||
		batchNameType === 'prepend_append' && !batchNamePrepend && !batchNameAppend
	) return media
	
	const batchNameTemplate = createNamingTemplate({
		type: batchNameType, 
		replacer: batchName?.trim(),
		prepend: batchNamePrepend?.trimStart(),
		append: batchNameAppend?.trimEnd()
	})

	return media.map(item => ({
		...item,
		filename: batchNameTemplate(item.filename)
	}))
}

const extractBatchNameProps = createObjectPicker(['batchNameType', 'batchName', 'batchNamePrepend', 'batchNameAppend'])

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
				toastr.error(errStr, false, TOASTR_OPTIONS)
			}
		}
	}
}

export const render = args => async dispatch => {
	const { goBack, removeLocation } = args
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
		applyPresetName,
		val => applyBatchName(val, extractBatchNameProps(args)),
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
