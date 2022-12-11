import toastr from 'toastr'

import * as ACTION from 'actions/types'
import * as shared from './shared'
import { errorToString, toastrOpts } from 'utilities'

const { interop } = window.ABLE2

// ---- REDUCER --------

export default (state, action) => { 
	const { type, payload, callback } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX: 
			return shared.toggleCheckbox(state, payload)
		case ACTION.UPDATE_NESTED_STATE:
			return shared.updateNestedState(state, payload)
		case ACTION.ENABLE_ASPECT_RATIO_MARKER:
			return enableAspectRatioMarker(state, payload)
		case ACTION.TOGGLE_NESTED_CHECKBOX: 
			return shared.toggleNestedCheckbox(state, payload)
		case ACTION.TOGGLE_SAVE_LOCATION:
			return shared.toggleSaveLocation(state, payload)
		case ACTION.UPDATE_SORTABLE_ELEMENT_FIELD:
			return updateSortableElementField(state, payload)
		case ACTION.ADD_SORTABLE_ELEMENT:
			return shared.addSortableElement(state, payload)
		case ACTION.REMOVE_SORTABLE_ELEMENT:
			return shared.removeSortableElement(state, payload)
		case ACTION.MOVE_SORTABLE_ELEMENT:
			return shared.moveSortableElement(state, payload)
		case ACTION.FIX_LOCATIONS_AND_SAVE:
			return fixSaveLocationsAndSave(state, callback)
		case ACTION.REMOVE_LOCATION_AND_SAVE:
			return removeLocationAndSave(state, payload)
		case ACTION.DISABLE_WARNING_AND_SAVE:
			return disableWarningAndSave(state, payload)
		default:
			return state
	}
}

// ---- "REACTIONS" --------

const enableAspectRatioMarker = (state, payload) => ({
	...state,
	aspectRatioMarkers: state.aspectRatioMarkers.map(marker => marker.id === payload.id ? {
		...marker,
		disabled: !marker.disabled
	} : marker)
})

const updateSortableElementField = (state, payload) => ({
	...state,
	[payload.nest]: state[payload.nest].map(obj => obj.id === payload.id ? {
		...obj,
		[payload.name]: payload.value
	} : obj)
})

const fixSaveLocationsAndSave = (state, callback) => {
	const newPrefs = {
		...state,
		saveLocations: state.saveLocations
			.filter(loc => loc.directory)
			.map(loc => loc.label ? loc : {
				...loc,
				label: loc.directory.split('/').pop()
			})
	}

	savePrefs(newPrefs, callback)

	return newPrefs
}

const removeLocationAndSave = (state, payload) => {
	const newPrefs = removeSortableElement(state, payload)

	savePrefs(newPrefs)

	return newPrefs
}

const disableWarningAndSave = (state, payload) => {
	const newPrefs = {
		...state,
		warnings: {
			...state.warnings,
			[payload.warning]: false
		}
	}

	savePrefs(newPrefs)

	return newPrefs
}
