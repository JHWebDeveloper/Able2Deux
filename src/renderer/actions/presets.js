import toastr from 'toastr'

import { ACTION, TOASTR_OPTIONS } from 'constants'
import { objectsAreEqual } from 'utilities'

const { interop } = window.ABLE2

export const loadPresetForSaving = mediaState => ({
	type: ACTION.LOAD_PRESET_FOR_SAVING,
	payload: { mediaState }
})

export const loadPresetsForEditing = payload => ({
	type: ACTION.LOAD_PRESETS_FOR_EDITING,
	payload
})

export const addNewPreset = (element, offset) => ({
	type: ACTION.ADD_NEW_PRESET,
	payload: { element, offset }
})

export const removePreset = id => ({
	type: ACTION.REMOVE_PRESET,
	payload: { id }
})

export const duplicatePreset = index => ({
	type: ACTION.DUPLICATE_PRESET,
	payload: { index }
})

export const selectPresetById = id => dispatch => {
	dispatch({
		type: ACTION.SELECT_PRESET_BY_ID,
		payload: { id }
	})
}

export const selectPresetByIndex = index => dispatch => {
	dispatch({
		type: ACTION.SELECT_PRESET_BY_INDEX,
		payload: { index }
	})
}

export const updatePresetStateBySelection = properties => ({
	type: ACTION.UPDATE_PRESET_STATE_BY_SELECTION,
	payload: { properties }
})

export const updatePresetStateById = (id, properties) => ({
	type: ACTION.UPDATE_PRESET_STATE_BY_ID,
	payload: { id, properties }
})

export const togglePresetState = property => ({
	type: ACTION.TOGGLE_PRESET_STATE,
	payload: { property }
})

export const togglePresetLimitTo = mediaType => ({
	type: ACTION.TOGGLE_PRESET_LIMIT_TO,
	payload: { mediaType }
})

export const toggleIncludePresetAttribute = attribute => ({
	type: ACTION.TOGGLE_PRESET_ATTRIBUTE,
	payload: {
		key: 'include',
		attribute
	}
})

export const togglePresetAttribute = attribute => ({
	type: ACTION.TOGGLE_PRESET_ATTRIBUTE,
	payload: { attribute }
})

export const toggleAllPresetAttributes = checked => ({
	type: ACTION.TOGGLE_ALL_PRESET_ATTRIBUTES,
	payload: { checked }
})

export const updatePresetAttribute = (attribute, value) => ({
	type: ACTION.UPDATE_PRESET_ATTRIBUTE,
	payload: { attribute, value }
})

export const addPresetToBatch = (index, batchPresetId, presetId) => ({
	type: ACTION.ADD_PRESET_TO_BATCH,
	payload: { index, batchPresetId, presetId }
})

export const movePresetInBatch = (oldPos, newPos) => ({
	type: ACTION.MOVE_PRESET_IN_BATCH,
	payload: { oldPos, newPos }
})

export const flattenBatchPreset = (parentId, childId) => ({
	type: ACTION.FLATTEN_BATCH_PRESET,
	payload: { parentId, childId }
})

export const cleanupPresetsAndSave = closeOnSave => ({
	type: ACTION.CLEANUP_PRESETS_AND_SAVE,
	payload: {
		callback() {
			if (closeOnSave) {
				interop.closePresets()
			} else {
				toastr.success('Presets saved', false, { ...TOASTR_OPTIONS, timeOut: 2000 })
			}
		}
	}
})

export const closePresets = saveWarning => async dispatch => {
	const lastSave = await interop.requestPresets()

	dispatch({
		type: ACTION.CLOSE_PRESETS,
		payload: {
			callback(currentState) {
				saveWarning({
					skip: objectsAreEqual(lastSave, currentState)
				})
			}
		}
	})
}
