import toastr from 'toastr'

import { ACTION, TOASTR_OPTIONS } from 'constants'
import { errorToString } from 'utilities'
import * as shared from 'reducer/shared'

// ---- REDUCER --------

export const prefsReducer = (state, action) => { 
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX: 
			return shared.toggleCheckbox(state, payload)
		case ACTION.UPDATE_SCRATCH_DISK:
			return updateScratchDisk(state, payload)
		case ACTION.TOGGLE_WARNING:
			return toggleWarning(state, payload)
		case ACTION.UPDATE_EDITOR_SETTINGS:
			return updateEditorSettings(state, payload)
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
			return cleanupPrefsAndSave(state, payload)
		case ACTION.REMOVE_LOCATION_AND_SAVE:
			return removeLocationAndSave(state, payload)
		case ACTION.CLOSE_PREFS:
			return closePrefs(state, payload)
		default:
			return state
	}
}

// ---- "REACTIONS" --------

const savePrefs = async (prefs, callback) => {
	try {
		await window.ABLE2.interop.savePrefs(prefs)
		callback?.()
	} catch (err) {
		toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}
}

const updateScratchDisk = (state, { properties }) => ({
	...state,
	scratchDisk: {
		...state.scratchDisk,
		...properties
	}
})

const toggleWarning = (state, payload) => {
	const { property, save } = payload

	const nextState = {
		...state,
		warnings: {
			...state.warnings,
			[property]: !state.warnings[property]
		}
	}

	if (save) savePrefs(nextState)

	return nextState
}

const updateEditorSettings = (state, { properties }) => ({
	...state,
	editorSettings: {
		...state.editorSettings,
		...properties
	}
})

const updateSortableElementField = (state, payload) => ({
	...state,
	[payload.nest]: state[payload.nest].map(obj => obj.id === payload.id ? {
		...obj,
		...payload.properties
	} : obj)
})

const cleanupPrefsAndSave = (state, { callback }) => {
	const nextState = {
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

	savePrefs(nextState, callback)

	return nextState
}

const removeLocationAndSave = (state, payload) => {
	const nextState = shared.removeSortableElement(state, payload)

	savePrefs(nextState)

	return nextState
}

const closePrefs = (state, { callback }) => {
	callback(state)
	return state
}
