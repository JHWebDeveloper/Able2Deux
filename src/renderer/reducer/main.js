import * as ACTION from 'actions/types'
import * as STATUS from 'status'
import * as shared from 'reducer/shared'

import {
	arrayCount,
	clamp,
	findNearestIndex,
	replaceIds,
	sortCurvePoints
} from 'utilities'

// ---- REDUCER --------

export const mainReducer = (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX:
			return shared.toggleCheckbox(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_SELECTION:
			return updateMediaStateBySelection(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_ID:
			return updateMediaStateById(state, payload)
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
			return removeAllMedia(state)
		case ACTION.SELECT_MEDIA:
			return selectMedia(state, payload)
		case ACTION.SELECT_ALL_MEDIA:
			return selectAllMedia(state, payload)
		case ACTION.DESELECT_ALL_MEDIA:
			return deselectAllMedia(state)
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
		case ACTION.REMOVE_FAILED_ACQUISITIONS:
			return removeFailedAcquisitions(state)
		case ACTION.COPY_ATTRIBUTES:
			return copyAttributes(state, payload)
		case ACTION.PASTE_SETTINGS:
			return pasteSettings(state, payload)
		case ACTION.APPLY_TO_ALL:
			return applyToAll(state, payload)
		case ACTION.APPLY_TO_SELECTION:
			return applyToSelection(state, payload)
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
		case ACTION.START_OVER:
			return startOver(state)
		default:
			return state
	}
}

// ---- GENERIC MEDIA STATE --------

const updateMediaStateBySelection = (state, payload) => ({
	...state,
	media: state.media.map(item => item.selected ? {
		...item,
		...payload.properties
	} : item)
})

const updateMediaStateById = (state, payload) => ({
	...state,
	media: state.media.map(item => item.id === payload.id ? {
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

const unselectedProps = {
	focused: false,
	anchored: false,
	selected: false
}

const startOver = state => ({
	...state,
	media: []
})

// ---- SELECT MEDIA --------

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
	const { ctrlOrCmd, shift } = payload
	let media = []

	payload.clickedIndex = clamp(payload.clickedIndex, 0, state.media.length - 1)

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
		...unselectedProps
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
			...unselectedProps
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
			...unselectedProps
		})
	}

	return { ...state, media }
}

// ---- APPLY PRESET --------

const applyPreset = (state, payload) => {
	const { presets, mediaIds, duplicate } = payload
	let media = [...state.media]

	if (!duplicate) {
		const lastPreset = presets.pop()

		media = media.map(item => mediaIds.includes(item.id) ? {
			...item,
			...lastPreset.attributes
		} : item)
	}

	const mediaIdsLen = mediaIds.length
	const presetsLen = presets.length

	for (let i = 0; i < mediaIdsLen; i++) {
		const mediaId = mediaIds[i]
		let mediaIndex = media.findIndex(({ id }) => id === mediaId)

		for (let j = 0; j < presetsLen; j++) {
			media.splice(mediaIndex, 0, replaceIds({
				...media[mediaIndex++],
				...presets[j].attributes,
				...unselectedProps
			}))
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
	const { openPresetSaveAs, id, } = payload

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

const removeReferencedMedia = (state, payload) => (
	state.media.reduce((acc, { refId, id }) => (
		payload.refId === refId ? removeMedia(acc, { id, updateSelection: true }) : acc
	), structuredClone(state))
)

const removeSelectedMedia = state => (
	state.media.reduce((acc, { selected, id }) => (
		selected ? removeMedia(acc, { id, updateSelection: true }) : acc
	), structuredClone(state))
)

const removeAllMedia = state => ({
	...state,
	media: []
})

const removeFailedAcquisitions = state => ({
	...state,
	media: state.media.filter(item => item.status !== STATUS.FAILED)
})

// ---- COPY/PASTE PROPERTIES --------

const copyAttributes = (state, payload) => ({
	...state,
	clipboard: payload.extractAttributes(state.media.find(item => item.id === payload.id))
})

const pasteSettings = (state, payload) => ({
	...state,
	media: state.media.map(item => item.id === payload.id ? {
		...item,
		...replaceIds(state.clipboard)
	} : item)
})

const applyToAll = (state, payload) => {
	const { id, extractAttributes } = payload
	const attributes = extractAttributes(state.media.find(item => item.id === id))

	return ({
		...state,
		media: state.media.map(item => item.id !== id ? {
			...item,
			...replaceIds(attributes)
		} : item)
	})
}

const applyToSelection = (state, payload) => {
	const { id, extractAttributes } = payload
	const attributes = extractAttributes(state.media.find(item => item.id === id))

	return ({
		...state,
		media: state.media.map(item => item.selected && item.id !== id ? {
			...item,
			...replaceIds(attributes)
		} : item)
	})
}

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
