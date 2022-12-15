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
		case ACTION.TOGGLE_NESTED_CHECKBOX: 
			return shared.toggleNestedCheckbox(state, payload)
		case ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX:
			return shared.toggleSortableElementCheckbox(state, payload)
		case ACTION.UPDATE_SORTABLE_ELEMENT_FIELD:
			return updateSortableElementField(state, payload)
		case ACTION.ADD_SORTABLE_ELEMENT:
			return shared.addSortableElement(state, payload)
		case ACTION.REMOVE_SORTABLE_ELEMENT:
			return shared.removeSortableElement(state, payload)
		case ACTION.MOVE_SORTABLE_ELEMENT:
			return shared.moveSortableElement(state, payload)
		case ACTION.CLEANUP_PREFS_AND_SAVE:
			return cleanupPrefsAndSave(state, callback)
		case ACTION.REMOVE_LOCATION_AND_SAVE:
			return removeLocationAndSave(state, payload)
		case ACTION.DISABLE_WARNING_AND_SAVE:
			return disableWarningAndSave(state, payload)
		default:
			return state
	}
}

// ---- "REACTIONS" --------

const updateSortableElementField = (state, payload) => ({
	...state,
	[payload.nest]: state[payload.nest].map(obj => obj.id === payload.id ? {
		...obj,
		[payload.name]: payload.value
	} : obj)
})

const savePrefs = async (prefs, callback) => {
	try {
		await interop.savePrefs(prefs)
		callback?.()
	} catch (err) {
		toastr.error(errorToString(err), false, toastrOpts)
	}
}

const cleanupPrefsAndSave = (state, callback) => {
	const newPrefs = {
		...state,
		aspectRatioMarkers: state.aspectRatioMarkers
			.filter(mrkr => mrkr.ratio.length === 2)
			.map(mrkr => mrkr.label ? mrkr : {
				...mrkr,
				label: mrkr.ratio.join(':').slice(0, 6)
			}),
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
	const newPrefs = shared.removeSortableElement(state, payload)

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
