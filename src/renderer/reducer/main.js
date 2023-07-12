import { v1 as uuid } from 'uuid'

import * as ACTION from 'actions/types'
import * as STATUS from 'status'
import * as shared from 'reducer/shared'

import {
	selectMedia,
	selectAllMedia,
	deselectAllMedia,
	removeMedia
} from 'reducer/selectMedia'

import { replaceIds, sortCurvePoints } from 'utilities'

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
		case ACTION.REMOVE_MEDIA:
			return removeMedia(state, payload)
		case ACTION.SELECT_MEDIA:
			return selectMedia(state, payload)
		case ACTION.SELECT_ALL_MEDIA:
			return selectAllMedia(state)
		case ACTION.DESELECT_ALL_MEDIA:
			return deselectAllMedia(state)
		case ACTION.DUPLICATE_MEDIA: 
			return duplicateMedia(state, payload)
		case ACTION.DUPLICATE_SELECTED_MEDIA: 
			return duplicateSelectedMedia(state)
		case ACTION.SPLIT_MEDIA: 
			return splitMedia(state, payload)
		case ACTION.REMOVE_FAILED_ACQUISITIONS:
			return removeFailedAcquisitions(state)
		case ACTION.PASTE_SETTINGS:
			return pasteSettings(state, payload)
		case ACTION.APPLY_TO_ALL:
			return applyToAll(state, payload)
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

// ---- "REACTIONS" --------

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

const getDuplicateProps = () => ({
	focused: false,
	anchored: false,
	selected: false,
	id: uuid()
})

const duplicateMedia = (state, payload) => {
	const { index } = payload
	const media = [...state.media]

	media.splice(index, 0, {
		...state.media[index],
		...getDuplicateProps()
	})

	return { ...state, media }
}

const duplicateSelectedMedia = state => {
	const media = [...state.media]

	for (let i = 0; i < media.length; i++) {
		const originalMedia = media[i]

		if (!originalMedia.selected) continue

		media.splice(i++, 0, {
			...originalMedia,
			...getDuplicateProps()
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
			...media[insertAt],
			...timecodes[i],
			...getDuplicateProps()
		})
	}

	return { ...state, media }
}

const removeFailedAcquisitions = state => ({
	...state,
	media: state.media.filter(item => item.status !== STATUS.FAILED)
})

const pasteSettings = (state, payload) => {
	const { copiedSettings } = state

	return {
		...state,
		media: state.media.map(item => item.id === payload.id ? {
			...item,
			...copiedSettings
		} : item)
	}
}

const applyToAll = (state, payload) => {
	const { id, properties } = payload

	return {
		...state,
		media: state.media.map(item => item.id !== id ? {
			...item,
			...properties
		} : item)
	}
}

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

const startOver = state => ({
	...state,
	media: []
})
