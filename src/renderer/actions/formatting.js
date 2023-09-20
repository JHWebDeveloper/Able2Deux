import toastr from 'toastr'

import * as ACTION from 'actions/types'

import {
	addMedia,
	updateMediaStateById,
	updateMediaStateBySelection
} from 'actions'

import {
	TOASTR_OPTIONS,
	clamp,
	createMediaData,
	createCurvePoint,
	createDefaultCurvePoints,
	errorToString,
	pipe,
	pipeAsync,
	refocusBatchItem
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

export const applyPreset = (presetId, mediaIds, duplicate) => async dispatch => {
	if (typeof mediaIds === 'string') mediaIds = [mediaIds]

	dispatch({
		type: ACTION.APPLY_PRESET,
		payload: {
			presets: await interop.getPresetAttributes(presetId),
			mediaIds,
			duplicate
		}
	})
}

export const applyPresetToSelected = ({ presetId, applyToAll, duplicate }) => async dispatch => {	
	dispatch({
		type: ACTION.APPLY_PRESET_TO_SELECTED,
		payload: {
			presets: await interop.getPresetAttributes(presetId),
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
			const { presetNamePrepend, presetNameAppend } = attributes

			interop.openPresetsSaveAs({
				...pipe(...extractors)(attributes),
				...presetNamePrepend ? { presetNamePrepend } : {},
				...presetNameAppend ? { presetNameAppend } : {},
			})
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
