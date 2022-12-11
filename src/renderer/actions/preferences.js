import toastr from 'toastr'
import { v1 as uuid } from 'uuid'

import * as ACTION from './types'
import { addNewSortableElement } from '.'
import { errorToString, toastrOpts } from 'utilities'

const { interop } = window.ABLE2

export const loadPrefs = () => async dispatch => {
	try {
		dispatch({
			type: ACTION.UPDATE_STATE,
			payload: await interop.requestPrefs()
		})
	} catch (err) {
		toastr.error(errorToString(err), false, toastrOpts)
	}
}

export const fixLocationsAndSave = saveAndClose => ({
	type: ACTION.FIX_LOCATIONS_AND_SAVE,
	callback() {
		if (saveAndClose) {
			interop.closePreferences()
		} else {
			toastr.success('Preferences saved', false, { ...toastrOpts, timeOut: 2000 })
		}
	}
})

export const disableWarningAndSave = warning => ({
	type: ACTION.DISABLE_WARNING_AND_SAVE,
	payload: { warning }
})

export const enableAspectRatioMarker = id => ({
	type: ACTION.ENABLE_ASPECT_RATIO_MARKER,
	payload: { id }
})

export const removeLocationAndSave = id => ({
	type: ACTION.REMOVE_LOCATION_AND_SAVE,
	payload: { id, nest: 'saveLocations' }
})

export const addNewLocation = (index, e) => dispatch => {
	addNewSortableElement('saveLocations', {
		id: uuid(),
		checked: false,
		label: '',
		directory: ''
	}, index, e)(dispatch)
}

export const addNewAspectRatioMarker = (index, e) => dispatch => {
	addNewSortableElement('aspectRatioMarkers', {
		id: uuid(),
		disabled: true,
		selected: false,
		label: '',
		ratio: [1, 1]
	}, index, e)(dispatch)
}

export const restoreDefaultPrefs = () => async dispatch => {
	const defaults = await interop.requestDefaultPrefs()

	dispatch({
		type: ACTION.UPDATE_STATE,
		payload: defaults
	})
}
