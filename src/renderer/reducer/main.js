import * as ACTION from 'actions/types'
import * as STATUS from 'status'
import * as shared from 'reducer/shared'

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
		case ACTION.DUPLICATE_MEDIA: 
			return duplicateMedia(state, payload)
		case ACTION.SPLIT_MEDIA: 
			return splitMedia(state, payload)
		case ACTION.PREPARE_MEDIA_FOR_FORMAT:
			return prepareMediaForFormat(state)
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

const updateMediaState = (state, payload) => {
	const { id, properties, editAll } = payload

	return {
		...state,
		media: state.media.map(item => editAll || item.id === id ? {
			...item,
			...properties
		} : item)
	}
}

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

const duplicate = (insert, media) => {
	media = [...media]
	
	const index = media.findIndex(item => item.id === insert.id)

	media.splice(index, 0, {
		...media[index],
		...insert.changes,
		id: insert.newId
	})

	return media
}

const duplicateMedia = (state, payload) => {
	const media = duplicate(payload, state.media)

	return { ...state, media }
}

const splitMedia = (state, payload) => {
	const len = payload.duplicates.length
	let { media } = state

	for (let i = 0; i < len; i++) {
		media = duplicate({
			...payload.duplicates[i],
			id: payload.id
		}, media)
	}

	return { ...state, media }
}

const prepareMediaForFormat = state => {
	const media = state.media.filter(item => item.status !== STATUS.FAILED)

	return {
		...state,
		media,
		selectedId: media[0].id
	}
}

const pasteSettings = (state, payload) => ({
	...state,
	media: state.media.map(item => item.id === payload.id ? {
		...item,
		...state.copiedSettings
	} : item)
})

const applyToAll = (state, payload) => ({
	...state,
	media: state.media.map(item => item.id !== payload.id ? {
		...item,
		...payload.properties
	} : item)
})

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
