import toastr from 'toastr'
import { v1 as uuid } from 'uuid'

import * as ACTION from './types'
import { toastrOpts } from '../utilities'

const { interop } = window.ABLE2

export const loadPrefs = () => async dispatch => {
	try {
		dispatch({
			type: ACTION.UPDATE_STATE,
			payload: await interop.requestPrefs()
		})
	} catch (err) {
		toastr.error('Unable to load preferences', false, toastrOpts)
	}
}

export const savePrefs = prefs => async dispatch => {
	prefs.saveLocations = prefs.saveLocations
		.filter(loc => loc.directory)
		.map(loc => loc.label ? loc : {
			...loc,
			label: loc.directory.split('/').pop()
		})

	try {
		await interop.savePrefs(prefs)

		dispatch({
			type: ACTION.UPDATE_STATE,
			payload: prefs
		})

		toastr.success('Preferences saved', false, { ...toastrOpts, timeOut: 2000 })
	} catch (err) {
		toastr.error('Preferences failed to save', false, toastrOpts)
	}
}

export const updateLocationField = (id, name, value) => ({
	type: ACTION.UPDATE_LOCATION_FIELD,
	payload: { id, name, value }
})

export const updateLocationFieldFromEvent = (id, e) => dispatch => {
	const { name, value } = e.target

	dispatch({
		type: ACTION.UPDATE_LOCATION_FIELD,
		payload: { id, name, value }
	})
}

const addLocation = payload => ({
	type: ACTION.ADD_LOCATION,
	payload
})

export const addNewLocation = (index, e) => dispatch => {
		const pos = e.shiftKey ? 1 : 0
	
		dispatch(addLocation({
			pos: index + pos,
			location: {
				id: uuid(),
				checked: false,
				label: '',
				directory: ''
			}
		}))
}

export const removeLocation = id => ({
	type: ACTION.REMOVE_LOCATION,
	payload: { id }
})

export const moveLocation = (pos, dir = 1) => ({
	type: ACTION.MOVE_LOCATION,
	payload: {
		oldPos: pos,
		newPos: pos + dir
	}
})
