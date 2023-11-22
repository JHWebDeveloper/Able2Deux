import { ACTION, RATIO_9_16 } from 'constants'

import {
	arrayCount,
	calcRotatedBoundingBox,
	clamp,
	constrainPairedValue,
	createHistoryStack,
	degToRad,
	detectMediaIsSideways,
	findNearestIndex,
	replaceIds,
	sortCurvePoints
} from 'utilities'

import * as shared from 'reducer/shared'

// ---- REDUCER --------

export const mainReducer = createHistoryStack().connectReducer((state, action, history) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX:
			return shared.toggleCheckbox(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_SELECTION:
			return updateMediaStateBySelection(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_ID:
			return shared.updateMediaStateById(state, payload)
		case ACTION.TOGGLE_MEDIA_CHECKBOX:
			return toggleMediaCheckbox(state, payload)
		case ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX:
			return shared.toggleSortableElementCheckbox(state, payload)
		case ACTION.ADD_SORTABLE_ELEMENT:
			return shared.addSortableElement(state, payload)
		case ACTION.REMOVE_SORTABLE_ELEMENT:
			return shared.removeSortableElement(state, payload)
		case ACTION.MOVE_SORTABLE_ELEMENT:
			return shared.moveSortableElement(state, payload)
		case ACTION.MOVE_SELECTED_MEDIA:
			return moveSelectedMedia(state, payload)
		case ACTION.REMOVE_MEDIA:
			return removeMedia(state, payload)
		case ACTION.REMOVE_REFERENCED_MEDIA:
			return removeReferencedMedia(state, payload)
		case ACTION.REMOVE_SELECTED_MEDIA:
			return removeSelectedMedia(state)
		case ACTION.REMOVE_ALL_MEDIA:
			return shared.removeAllElements(state)
		case ACTION.SELECT_MEDIA:
			return selectMedia(state, payload)
		case ACTION.SELECT_ALL_MEDIA:
			return selectAllMedia(state, payload)
		case ACTION.DESELECT_ALL_MEDIA:
			return deselectAllMedia(state)
		case ACTION.SELECT_DUPLICATES:
			return selectDuplicates(state, payload)
		case ACTION.DUPLICATE_MEDIA: 
			return duplicateMedia(state, payload)
		case ACTION.DUPLICATE_SELECTED_MEDIA: 
			return duplicateSelectedMedia(state, payload)
		case ACTION.SPLIT_MEDIA: 
			return splitMedia(state, payload)
		case ACTION.APPLY_PRESET:
			return applyPreset(state, payload)
		case ACTION.APPLY_PRESET_TO_SELECTED:
			return applyPresetToSelected(state, payload)
		case ACTION.SAVE_AS_PRESET:
			return saveAsPreset(state, payload)
		case ACTION.COPY_ATTRIBUTES:
			return copyAttributes(state, payload)
		case ACTION.PASTE_ATTRIBUTES:
			return pasteAttributes(state, payload)
		case ACTION.APPLY_TO_ALL:
			return applyToAll(state, payload)
		case ACTION.APPLY_TO_SELECTION:
			return applyToSelection(state, payload)
		case ACTION.FIT_TO_FRAME_WIDTH:
			return fitSelectedMediaToFrameWidth(state, payload)
		case ACTION.FIT_TO_FRAME_HEIGHT:
			return fitSelectedMediaToFrameHeight(state, payload)
		case ACTION.FIT_TO_FRAME_AUTO:
			return fitSelectedMediaToFrameAuto(state, payload)
		case ACTION.CROP_SELECTED:
			return cropSelected(state, payload)
		case ACTION.ROTATE_MEDIA:
			return rotateSelectedMedia(state, payload)
		case ACTION.REFLECT_MEDIA:
			return reflectSelectedMedia(state, payload)
		case ACTION.ADD_CURVE_POINT:
			return addCurvePoint(state, payload)
		case ACTION.ADD_OR_UPDATE_CURVE_POINT:
			return addOrUpdateCurvePoint(state, payload)
		case ACTION.DELETE_CURVE_POINT:
			return deleteCurvePoint(state, payload)
		case ACTION.RESET_CURVE:
			return resetCurve(state, payload)
		case ACTION.CLEANUP_CURVE:
			return cleanupCurve(state, payload)
		case ACTION.UNDO:
			return history.undo()
		case ACTION.REDO:
			return history.redo()
		case ACTION.CLEAR_UNDO_HISTORY:
			return history.clear()
		default:
			return state
	}
})

// ---- GENERIC MEDIA STATE --------

const updateMediaStateBySelection = (state, payload) => ({
	...state,
	media: state.media.map(item => item.selected ? {
		...item,
		...payload.properties
	} : item)
})

const toggleMediaCheckbox = (state, payload) => {
	const { id, property } = payload
	const invertedValue = !state.media.find(item => item.id === id)[property]

	return {
		...state,
		media: state.media.map(item => item.selected ? {
			...item,
			[property]: invertedValue
		} : item)
	}
}

// ---- SELECT MEDIA --------

const UNSELECTED_PROPS = Object.freeze({
	focused: false,
	anchored: false,
	selected: false
})

const selectMediaByShiftClick = (media, { clickedIndex }) => {
	const focusedIndex = media.findIndex(({ focused }) => focused)
	const anchoredIndex = media.findIndex(({ anchored }) => anchored)

	let start = Math.min(focusedIndex, anchoredIndex)
	let end = Math.max(focusedIndex, anchoredIndex)
 
	media = media.map((item, i) => i >= start && i <= end ? {
		...item,
		focused: false,
		selected: false
	} : item)

	start = Math.min(clickedIndex, anchoredIndex)
	end = Math.max(clickedIndex, anchoredIndex)

	return media.map((item, i) => i === clickedIndex ? {
		...item,
		focused: true,
		selected: true
	} : i >= start && i <= end ? {
		...item,
		focused: false,
		selected: true
	} : item)
}

const selectMediaByCtrlClick = (media, { clickedIndex, clickedInFocus, clickedIsAnchored, clickedInSelection }) => {
	if (clickedInFocus || clickedIsAnchored) {
		const nearestSelectedIndex = findNearestIndex(media, clickedIndex, ({ selected }) => selected)

		return media.map((item, i) => i === nearestSelectedIndex ? {
			...item,
			focused: clickedInFocus,
			anchored: clickedIsAnchored
		} : i === clickedIndex ? {
			...item,
			focused: clickedInFocus ? false : item.focused,
			anchored: clickedIsAnchored ? false : item.anchored,
			selected: false
		} : item)
	} else if (clickedInSelection) {
		return media.map((item, i) => i === clickedIndex ? {
			...item,
			selected: false
		} : item)
	} else {
		return media.map((item, i) => {
			const focused = i === clickedIndex

			return {
				...item,
				focused,
				anchored: focused,
				selected: focused || item.selected
			}
		})
	}
}

const selectMediaByClick = (media, { clickedIndex, clickedInFocus, clickedInSelection }) => {
	if (clickedInFocus) {
		return [...media]
	} else if (clickedInSelection) {
		return media.map((item, i) => {
			const focused = i === clickedIndex

			return {
				...item,
				focused,
				anchored: focused
			}
		})
	} else {
		return media.map((item, i) => {
			const focused = i === clickedIndex

			return {
				...item,
				focused,
				anchored: focused,
				selected: focused
			}
		})
	}
}

const selectMedia = (state, payload) => {
	const { ctrlOrCmd, shift, arrowKeyDir, clickedIndex } = payload
	let media = []

	// check selection status of related target if from keydown event
	switch (arrowKeyDir) {
		case 'prev':
			payload.selected = state.media[clickedIndex - 1]?.selected
			break
		case 'next':
			payload.selected = state.media[clickedIndex + 1]?.selected
			break
		default:
			break
	}

	// loop selection if target is out of bounds
	if (clickedIndex < 0) {
		payload.clickedIndex = state.media.length - 1
	} else if (clickedIndex >= state.media.length) {
		payload.clickedIndex = 0
	}

	if (ctrlOrCmd) {
		media = selectMediaByCtrlClick(state.media, payload)
	} else if (shift) {
		media = selectMediaByShiftClick(state.media, payload)
	} else {
		media = selectMediaByClick(state.media, payload)
	}
	
	return { ...state, media }
}

const selectAllMedia = (state, { focusIndex }) => {
	const updateFocus = !!focusIndex || focusIndex === 0

	return {
		...state,
		media: state.media.map((item, i) => item.focused ? {
			...item,
			focused: updateFocus ? focusIndex === i : true,
			anchored: true
		} : {
			...item,
			focused: updateFocus && focusIndex === i,
			anchored: false,
			selected: true
		})
	}
}

const deselectAllMedia = state => ({
	...state,
	media: state.media.map(item => item.focused ? {
		...item,
		anchored: true
	} : {
		...item,
		anchored: false,
		selected: false
	})
})

const selectDuplicates = (state, payload) => ({
	...state,
	media: state.media.map((item, i) => {
		const focused = payload.index === i

		return {
			...item,
			selected: payload.refId === item.refId,
			focused,
			anchored: focused
		}
	})
})

// ---- COPY/PASTE PROPERTIES --------

const copyAttributes = (state, { extractAttributes, id }) => ({
	...state,
	fixed: {
		...state.fixed,
		clipboard: extractAttributes(state.media.find(item => item.id === id))
	}
})

const pasteAttributes = (state, { id }) => ({
	...state,
	media: state.media.map(item => item.id === id ? {
		...item,
		...replaceIds(state.fixed.clipboard)
	} : item)
})

const applyToAll = (state, payload) => {
	const { id, extractAttributes } = payload
	const attributes = extractAttributes(state.media.find(item => item.id === id))

	return {
		...state,
		media: state.media.map(item => item.id !== id ? {
			...item,
			...replaceIds(attributes)
		} : item)
	}
}

const applyToSelection = (state, payload) => {
	const { id, extractAttributes } = payload
	const attributes = extractAttributes(state.media.find(item => item.id === id))

	return {
		...state,
		media: state.media.map(item => item.selected && item.id !== id ? {
			...item,
			...replaceIds(attributes)
		} : item)
	}
}

// ---- SORT MEDIA --------

const moveSelectedMedia = (state, { index }) => {
	const shiftIndexBy = arrayCount(state.media, (item, i) => i < index && item.selected)
	const selected = state.media.filter(item => item.selected)

	return {
		...state,
		media: state.media
			.filter(item => !item.selected)
			.toSpliced(clamp(index - shiftIndexBy, 0, state.media.length), 0, ...selected)
	}
}

// ----  DUPLICATE MEDIA --------

const duplicateMedia = (state, payload) => {
	const { index } = payload
	const media = [...state.media]

	media.splice(index, 0, {
		...replaceIds(state.media[index]),
		...UNSELECTED_PROPS
	})

	return { ...state, media }
}

const duplicateSelectedMedia = (state, { duplicateAll }) => {
	const media = [...state.media]

	for (let i = 0; i < media.length; i++) {
		const originalMedia = media[i]

		if (!duplicateAll && !originalMedia.selected) continue

		media.splice(i++, 0, {
			...replaceIds(originalMedia),
			...UNSELECTED_PROPS
		})
	}

	return { ...state, media }
}

const splitMedia = (state, payload) => {
	const { id, timecodes } = payload
	const len = timecodes.length
	const media = [...state.media]
	const index = media.findIndex(item => item.id === id)

	for (let i = 0; i < len; i++) {
		const insertAt = index + i

		media.splice(insertAt, 0, {
			...replaceIds(media[insertAt]),
			...timecodes[i],
			...UNSELECTED_PROPS
		})
	}

	return { ...state, media }
}

// ---- APPLY PRESET --------

const constrainPairedPresetValue = (itemL, itemR, keyA, keyB) => {
	const oneKeyOnly = !!(keyA in itemR ^ keyB in itemR)

	if (oneKeyOnly && itemR[keyA] > itemL[keyB]) {
		return constrainPairedValue(keyA, keyB, true)(itemL, itemR[keyA])
	} else if (oneKeyOnly && itemR[keyB] < itemL[keyA]) {
		return constrainPairedValue(keyB, keyA)(itemL, itemR[keyB])
	}

	return {}
}

const mergePresetWithMedia = (item, preset) => {
	if ('reflect' in preset) item = reflectMedia(item, preset.reflect)
	if ('transpose' in preset) item = rotateMedia(item, preset.transpose)

	return {
		...item,
		...preset
	}
}

const applyPreset = (state, payload) => {
	const { presets, mediaIds, duplicate } = payload

	if (!presets.length) return state

	const mediaIdsLength = mediaIds.length
	const media = [...state.media]

	for (let i = 0; i < mediaIdsLength; i++) {
		const mediaId = mediaIds[i]
		let mediaIndex = media.findIndex(({ id }) => id === mediaId)
		const item = media[mediaIndex]
		const applicablePresets = presets.filter(({ limitTo }) => limitTo.includes(item.mediaType))
		const presetsLength = applicablePresets.length
		const lastPresetIndex = presetsLength - 1

		for (let j = 0; j < presetsLength; j++) {
			let preset = applicablePresets[j]

			if (!preset.limitTo.includes(item.mediaType)) continue

			preset = {
				...preset,
				...constrainPairedPresetValue(item, preset.attributes, 'cropT', 'cropB'),
				...constrainPairedPresetValue(item, preset.attributes, 'cropL', 'cropR')
			}

			if (!duplicate && j === lastPresetIndex) {
				media[mediaIndex] = {
					...mergePresetWithMedia(item, replaceIds(preset)),
					id: item.id
				}
			} else {
				media.splice(mediaIndex++, 0, replaceIds({
					...mergePresetWithMedia(item, preset),
					...UNSELECTED_PROPS
				}))
			}
		}
	}

	return { ...state, media }
}

const applyPresetToSelected = (state, payload) => {
	const { applyToAll, duplicate, presets } = payload
	const mediaIds = state.media.reduce((acc, { selected, id }) => {
		if (applyToAll || selected) acc.push(id)
		return acc
	}, [])

	return applyPreset(state, {
		presets,
		mediaIds,
		duplicate
	})
}

const saveAsPreset = (state, payload) => {
	const { openPresetSaveAs, id } = payload

	openPresetSaveAs(state.media.find(item => item.id === id))

	return state
}

// ---- REMOVE MEDIA --------

const removeMedia = (state, payload) => {
	const len = state.media.length

	if (len < 2) return { ...state, media: [] }

	const media = [...state.media]
	const index = payload?.index ?? media.findIndex(item => item.id === payload.id)
	const { focused, anchored } = media[index]

	if (payload.updateSelection && (focused || anchored)) {
		const fallbackIndex = index + (index < len - 1 ? 1 : -1)
		const nearestSelectedIndex = findNearestIndex(media, index, ({ selected }) => selected, fallbackIndex)
	
		if (focused) media[nearestSelectedIndex].focused = true
		if (anchored) media[nearestSelectedIndex].anchored = true
	
		media[nearestSelectedIndex].selected = true
	}

	media.splice(index, 1)

	return { ...state, media }
}

// eslint-disable-next-line no-extra-parens
const removeReferencedMedia = (state, payload) => (
	state.media.reduce((acc, { refId, id }) => (
		payload.refId === refId ? removeMedia(acc, { id, updateSelection: true }) : acc
	), structuredClone(state))
)

// eslint-disable-next-line no-extra-parens
const removeSelectedMedia = state => (
	state.media.reduce((acc, { selected, id }) => (
		selected ? removeMedia(acc, { id, updateSelection: true }) : acc
	), structuredClone(state))
)

// ---- SCALE --------

const isAudioOrNotSelected = item => item.mediaType === 'audio' || !item.selected

const calculateAppliedDimensions = (item, axis) => {
	const { scaleX, scaleY, scaleLink, cropT, cropB, cropL, cropR, freeRotateMode, angle } = item

	const distortion = scaleY / scaleX || 1
	let appliedW = item.width * (cropR - cropL) / 100 / (axis === 'h' ? distortion : 1)
	let appliedH = item.height * (cropB - cropT) / 100 * (axis === 'w' ? distortion : 1)

	if (scaleLink && freeRotateMode === 'with_bounds' && angle !== 0) {
		const [ rotW, rotH ] = calcRotatedBoundingBox(appliedW, appliedH, degToRad(angle))

		appliedW = rotW
		appliedH = rotH
	}

	return {
		appliedW,
		appliedH,
		distortion
	}
}

const fitToFrameWidth = (item, frameW, preCalculated) => {
	const { appliedW, distortion } = preCalculated || calculateAppliedDimensions(item, 'w')
	const fitToWPrc = frameW / appliedW * 100

	return {
		...item,
		scaleX: fitToWPrc,
		scaleY: item.scaleLink ? fitToWPrc * distortion : item.scaleY
	}
}

const fitToFrameHeight = (item, frameH) => {
	const { appliedH, distortion } = calculateAppliedDimensions(item, 'h')
	const fitToHPrc = frameH / appliedH * 100

	return {
		...item,
		scaleX: item.scaleLink ? fitToHPrc / distortion : item.scaleX,
		scaleY: fitToHPrc
	}
}

const fitSelectedMediaToFrameWidth = (state, { frameW }) => ({
	...state,
	media: state.media.map(item => isAudioOrNotSelected(item) ? item : fitToFrameWidth(item, frameW))
})

const fitSelectedMediaToFrameHeight = (state, { frameH }) => ({
	...state,
	media: state.media.map(item => isAudioOrNotSelected(item) ? item : fitToFrameHeight(item, frameH))
})

const fitSelectedMediaToFrameAuto = (state, { sizingMethod, frameW, frameH }) => ({
	...state,
	media: state.media.map(item => {
		if (isAudioOrNotSelected(item)) return item

		const appliedDim = calculateAppliedDimensions(item, 'w')
		const isTall = appliedDim.appliedH / appliedDim.appliedW > RATIO_9_16

		if (sizingMethod === 'fill' && isTall || sizingMethod === 'fit' && !isTall) {
			return fitToFrameWidth(item, frameW, appliedDim)
		} else {
			return fitToFrameHeight(item, frameH)
		}
	})
})

// ---- CROP --------

const cropSelected = (state, { property, value }) => {
	let constrain = null
	
	switch (property) {
		case 'cropT':
			constrain = constrainPairedValue(property, 'cropB', true)
			break
		case 'cropB':
			constrain = constrainPairedValue(property, 'cropT')
			break
		case 'cropL':
			constrain = constrainPairedValue(property, 'cropR', true)
			break
		case 'cropR':
			constrain = constrainPairedValue(property, 'cropL')
			break
		default:
			return state
	}

	return {
		...state,
		media: state.media.map(item => item.selected ? ({
			...item,
			...constrain(item, value)
		}) : item)
	}
}

// ---- ROTATION --------

const CROP_PROPS = Object.freeze(['cropT', 'cropL', 'cropB', 'cropR'])
const TRANSPOSITIONS = Object.freeze(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2'])

const detectMediaOrientationChange = (prev, next) => !!(detectMediaIsSideways(prev) ^ detectMediaIsSideways(next))
const detectMediaIsReflected = (prev, next, reflect) => !(!prev.includes(reflect) ^ next.includes(reflect))

const rotateMedia = (item, transpose) => {
	const rotations = TRANSPOSITIONS.indexOf(transpose) - TRANSPOSITIONS.indexOf(item.transpose) + 4
	const cropVals = [item.cropT, item.cropL, 100 - item.cropB, 100 - item.cropR]

	let rotatedProps = {
		transpose,
		...CROP_PROPS.reduce((obj, dir, i) => {
			obj[dir] = cropVals[(rotations + i) % 4]
			return obj
		}, {})
	}

	rotatedProps.cropB = 100 - rotatedProps.cropB
	rotatedProps.cropR = 100 - rotatedProps.cropR

	if (detectMediaOrientationChange(item.transpose, transpose)) {
		rotatedProps = {
			...rotatedProps,
			width: item.height,
			height: item.width,
			aspectRatio: item.aspectRatio.split(':').reverse().join(':'),
			scaleX: item.scaleY,
			scaleY: item.scaleX
		}
	}

	return {
		...item,
		...rotatedProps
	}
}

const reflectMedia = (item, reflect) => {
	const reflectedProps = { reflect }
	const isFlippedH = detectMediaIsReflected(item.reflect, reflect, 'hflip')
	const isFlippedV = detectMediaIsReflected(item.reflect, reflect, 'vflip')
	const isSideways = detectMediaIsSideways(item.transpose)

	if (isFlippedH && isSideways || isFlippedV && !isSideways) {
		reflectedProps.cropT = 100 - item.cropB
		reflectedProps.cropB = 100 - item.cropT
	}
	
	if (isFlippedH && !isSideways || isFlippedV && isSideways) {
		reflectedProps.cropL = 100 - item.cropR
		reflectedProps.cropR = 100 - item.cropL
	}

	return {
		...item,
		...reflectedProps
	}
}

const rotateSelectedMedia = (state, payload) => ({
	...state,
	media: state.media.map(item => isAudioOrNotSelected(item) ? item : {
		...item,
		...rotateMedia(item, payload.transpose)
	})
})

const reflectSelectedMedia = (state, payload) => ({
	...state,
	media: state.media.map(item => isAudioOrNotSelected(item) ? item : {
		...item,
		...reflectMedia(item, payload.reflect)
	})
})

// ---- COLOR CORRECTION --------

const addCurvePoint = (state, payload) => {
	const { id, curveName, pointData } = payload

	const nextCurve = [...state.media.find(item => item.id === id)[curveName]]

	nextCurve.push(pointData)
	nextCurve.sort(sortCurvePoints)
	
	return {
		...state,
		media: state.media.map(item => item.id === id ? {
			...item,
			[curveName]: nextCurve
		} : item.selected ? {
			...item,
			[curveName]: replaceIds(nextCurve)
		} : item)
	}
}

const addOrUpdateCurvePoint = (state, payload) => {
	const { id, curveName, pointData } = payload

	let nextCurve = [...state.media.find(item => item.id === id)[curveName]]

	if (nextCurve.some(pt => pt.id === pointData.id)) {
		nextCurve = nextCurve.map(pt => pt.id === pointData.id ? pointData : pt)
	} else {
		nextCurve.push(pointData)
		nextCurve.sort(sortCurvePoints)
	}

	return {
		...state,
		media: state.media.map(item => item.id === id ? {
			...item,
			[curveName]: nextCurve
		} : item.selected ? {
			...item,
			[curveName]: replaceIds(nextCurve)
		} : item)
	}
}

const deleteCurvePoint = (state, payload) => {
	const { id, curveName, pointId } = payload

	const nextCurve = [...state.media.find(item => item.id === id)[curveName]].filter(pt => pt.id !== pointId)

	return {
		...state,
		media: state.media.map(item => item.id === id ? {
			...item,
			[curveName]: nextCurve
		} : item.selected ? {
			...item,
			[curveName]: replaceIds(nextCurve)
		} : item)
	}
}

const resetCurve = (state, payload) => {
	const { curveName, pointData } = payload

	const newCurves = curveName ? {
		[curveName]: pointData
	} : {
		ccRGB: [...pointData],
		ccR: [...pointData],
		ccG: [...pointData],
		ccB: [...pointData]
	}

	return {
		...state,
		media: state.media.map(item => item.selected ? {
			...item,
			...newCurves
		} : item)
	}
}

const cleanupCurve = (state, payload) => {
	const { curveName } = payload

	return {
		...state,
		media: state.media.map(item => item.selected ? {
			...item,
			[curveName]: item[curveName].filter(pt => !pt.hidden)
		} : item)
	}
}
