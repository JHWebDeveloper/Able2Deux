import toastr from 'toastr'

import * as ACTION from 'actions/types'
import * as shared from './shared'
import { toastrOpts } from 'utilities'

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
		case ACTION.TOGGLE_SAVE_LOCATION:
			return shared.toggleSaveLocation(state, payload)
		case ACTION.UPDATE_LOCATION_FIELD:
			return updateLocationField(state, payload)
		case ACTION.ADD_LOCATION:
			return addLocation(state, payload)
		case ACTION.REMOVE_LOCATION:
			return removeLocation(state, payload)
		case ACTION.MOVE_LOCATION:
			return moveLocation(state, payload)
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

const updateLocationField = (state, payload) => ({
	...state,
	saveLocations: state.saveLocations.map(location => location.id === payload.id ? {
		...location,
		[payload.name]: payload.value
	} : location)
})

const addLocation = (state, payload) => {
	const saveLocations = [...state.saveLocations]

	saveLocations.splice(payload.pos, 0, payload.location)
	
	return {
		...state,
		saveLocations
	}
}

const removeLocation = (state, payload) => ({
	...state,
	saveLocations: state.saveLocations.filter(({ id }) => id !== payload.id)
})

const moveLocation = (state, payload) => {
	let { oldPos, newPos } = payload
	const saveLocations = [...state.saveLocations]
	const targetLocation = saveLocations.splice(oldPos, 1)[0]

	if (oldPos < newPos) newPos--

	saveLocations.splice(newPos, 0, targetLocation)

	return {
		...state,
		saveLocations
	}
}

const savePrefs = async (prefs, callback) => {
	try {
		await interop.savePrefs(prefs)
		callback?.()
	} catch (err) {
		toastr.error('Preferences failed to save', false, toastrOpts)
	}
}

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
	const newPrefs = removeLocation(state, payload)

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
