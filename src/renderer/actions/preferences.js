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

export const enableAspectRatioMarker = id => ({
	type: ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX,
	payload: {
		property: 'disabled',
		nest: 'aspectRatioMarkers',
		id
	}
})

export const addNewAspectRatioMarker = (index, e) => dispatch => {
	addNewSortableElement('aspectRatioMarkers', {
		id: uuid(),
		disabled: true,
		selected: false,
		label: '',
		ratio: [1, 1]
	}, index, e)(dispatch)
}

export const addNewLocation = (index, e) => dispatch => {
	addNewSortableElement('saveLocations', {
		id: uuid(),
		checked: false,
		label: '',
		directory: ''
	}, index, e)(dispatch)
}

export const updateSortableElementField = (id, nest, name, value) => ({
	type: ACTION.UPDATE_SORTABLE_ELEMENT_FIELD,
	payload: { id, nest, name, value }
})

export const updateSortableElementFieldFromEvent = (id, nest, e) => dispatch => {
	const { name, value } = e.target

	dispatch({
		type: ACTION.UPDATE_SORTABLE_ELEMENT_FIELD,
		payload: { id, nest, name, value }
	})
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

export const removeLocationAndSave = id => ({
	type: ACTION.REMOVE_LOCATION_AND_SAVE,
	payload: { id, nest: 'saveLocations' }
})

export const disableWarningAndSave = warning => ({
	type: ACTION.DISABLE_WARNING_AND_SAVE,
	payload: { warning }
})

export const restoreDefaultPrefs = () => async dispatch => {
	const defaults = await interop.requestDefaultPrefs()

	dispatch({
		type: ACTION.UPDATE_STATE,
		payload: defaults
	})
}
