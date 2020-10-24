import toastr from 'toastr'
import { v1 as uuid } from 'uuid'

import * as ACTION from './types'
import { toastrOpts } from 'utilities'

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

export const fixLocationsAndSave = saveAndClose => ({
	type: ACTION.FIX_LOCATIONS_AND_SAVE,
	callback() {
		if (saveAndClose) {
			interop.closeCurrentWindow()
		} else {
			toastr.success('Preferences saved', false, { ...toastrOpts, timeOut: 2000 })
		}
	}
})

export const disableWarningAndSave = warning => ({
	type: ACTION.DISABLE_WARNING_AND_SAVE,
	payload: { warning }
})

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

export const moveLocation = (oldPos, newPos) => ({
	type: ACTION.MOVE_LOCATION,
	payload: { oldPos, newPos }
})

export const restoreDefaultPrefs = () => async dispatch => {
	const defaults = await interop.requestDefaultPrefs()

	dispatch({
		type: ACTION.UPDATE_STATE,
		payload: defaults
	})
}
