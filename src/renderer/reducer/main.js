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

import { copyCurve, sortCurvePoints } from 'utilities'

// ---- REDUCER --------

export const mainReducer = (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX:
			return shared.toggleCheckbox(state, payload)
		case ACTION.UPDATE_NESTED_STATE:
			return shared.updateNestedState(state, payload)
		case ACTION.TOGGLE_NESTED_CHECKBOX:
			return shared.toggleNestedCheckbox(state, payload)
		case ACTION.UPDATE_MEDIA_STATE:
			return updateMediaState(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_ID:
			return updateMediaStateById(state, payload)
		case ACTION.UPDATE_MEDIA_NESTED_STATE:
			return updateMediaNestedState(state, payload)
		case ACTION.TOGGLE_MEDIA_NESTED_CHECKBOX: 
			return toggleMediaNestedCheckbox(state, payload)
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

const updateMediaState = (state, payload) => ({
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

const updateMediaNestedState = (state, payload) => {
	const { id, nest, properties, editAll } = payload

	return {
		...state,
		media: state.media.map(item => editAll || item.id === id ? {
			...item,
			[nest]: {
				...item[nest],
				...properties
			}
		} : item)
	}
}

const toggleMediaNestedCheckbox = (state, payload) => {
	const { id, nest, property, editAll } = payload

	return {
		...state,
		media: state.media.map(item => editAll || item.id === id ? {
			...item,
			[nest]: {
				...item[nest],
				[property]: !item[nest][property]
			}
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
			...copiedSettings instanceof Function ? copiedSettings() : copiedSettings
		} : item)
	}
}

const applyToAll = (state, payload) => {
	const { properties } = payload
	const _properties = properties instanceof Function ? properties : () => properties

	return {
		...state,
		media: state.media.map(item => item.id !== payload.id ? {
			...item,
			..._properties()
		} : item)
	}
}

const addCurvePoint = (state, payload) => {
	const { id, curveName, pointData, editAll } = payload

	const nextCurve = [...state.media.find(obj => obj.id === id).colorCurves[curveName]]

	nextCurve.push(pointData)
	nextCurve.sort(sortCurvePoints)

	return {
		...state,
		media: state.media.map(obj => obj.id === id ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: nextCurve
			}
		} : editAll ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: copyCurve(nextCurve)
			}
		} : obj)
	}
}

const addOrUpdateCurvePoint = (state, payload) => {
	const { id, curveName, pointData, editAll } = payload

	let nextCurve = [...state.media.find(obj => obj.id === id).colorCurves[curveName]]

	if (nextCurve.some(pt => pt.id === pointData.id)) {
		nextCurve = nextCurve.map(pt => pt.id === pointData.id ? pointData : pt)
	} else {
		nextCurve.push(pointData)
		nextCurve.sort(sortCurvePoints)
	}

	return {
		...state,
		media: state.media.map(obj => obj.id === id ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: nextCurve
			}
		} : editAll ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: copyCurve(nextCurve)
			}
		} : obj)
	}
}

const deleteCurvePoint = (state, payload) => {
	const { id, curveName, pointId, editAll } = payload

	const nextCurve = [...state.media.find(obj => obj.id === id).colorCurves[curveName]].filter(pt => pt.id !== pointId)

	return {
		...state,
		media: state.media.map(obj => obj.id === id ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: nextCurve
			}
		} : editAll ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: copyCurve(nextCurve)
			}
		} : obj)
	}
}

const resetCurve = (state, payload) => {
	const { id, curveName, pointData, editAll } = payload

	const newCurveData = curveName ? {
		[curveName]: pointData
	} : {
		rgb: [...pointData],
		r: [...pointData],
		g: [...pointData],
		b: [...pointData]
	}

	return {
		...state,
		media: state.media.map(obj => editAll || obj.id === id ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				...newCurveData
			}
		} : obj)
	}
}

const cleanupCurve = (state, payload) => {
	const { id, curveName, editAll } = payload

	return {
		...state,
		media: state.media.map(obj => editAll || obj.id === id ? {
			...obj,
			colorCurves: {
				...obj.colorCurves,
				[curveName]: obj.colorCurves[curveName].filter(pt => !pt.hidden)
			}
		} : obj)
	}
}

const startOver = state => ({
	...state,
	media: []
})
