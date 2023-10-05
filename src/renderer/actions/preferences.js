import toastr from 'toastr'
import { v1 as uuid } from 'uuid'

import * as ACTION from 'actions/types'
import { addNewSortableElement } from 'actions'
import { TOASTR_OPTIONS } from 'constants'

const { interop } = window.ABLE2

export const updateScratchDisk = properties => ({
	type: ACTION.UPDATE_SCRATCH_DISK,
	payload: { properties }
})

export const toggleWarning = e => ({
	type: ACTION.TOGGLE_WARNING,
	payload: {
		property: e.target.name
	}
})

export const updateEditorSettings = e => ({
	type: ACTION.UPDATE_EDITOR_SETTINGS,
	payload: {
		properties: {
			[e.target.name]: e.target.value
		}
	}
})

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
		disabled: false,
		selected: false,
		label: '',
		ratio: [1, 1]
	}, index, e)(dispatch)
}

export const updateAspectRatioMarker = (id, properties) => ({
	type: ACTION.UPDATE_SORTABLE_ELEMENT_FIELD,
	payload: {
		nest: 'aspectRatioMarkers',
		id,
		properties
	}
})

export const addNewLocation = (index, e) => dispatch => {
	addNewSortableElement('saveLocations', {
		id: uuid(),
		hidden: false,
		checked: false,
		label: '',
		directory: ''
	}, index, e)(dispatch)
}

export const updateSaveLocation = (id, properties) => ({
	type: ACTION.UPDATE_SORTABLE_ELEMENT_FIELD,
	payload: {
		nest: 'saveLocations',
		id,
		properties
	}
})

export const cleanupPrefsAndSave = saveAndClose => ({
	type: ACTION.CLEANUP_PREFS_AND_SAVE,
	callback() {
		if (saveAndClose) {
			interop.closePreferences()
		} else {
			toastr.success('Preferences saved', false, { ...TOASTR_OPTIONS, timeOut: 2000 })
		}
	}
})

export const removeLocationAndSave = id => ({
	type: ACTION.REMOVE_LOCATION_AND_SAVE,
	payload: { id, nest: 'saveLocations' }
})

export const disableWarningAndSave = property => ({
	type: ACTION.TOGGLE_WARNING,
	payload: {
		property,
		save: true
	}
})

export const restoreDefaultPrefs = () => async dispatch => {
	const defaults = await interop.requestDefaultPrefs()

	dispatch({
		type: ACTION.UPDATE_STATE,
		payload: defaults
	})
}
