import toastr from 'toastr'

import * as shared from 'reducer/shared'
import * as ACTION from 'actions/types'
import { TOASTR_OPTIONS } from 'constants'

import {
	arrayCount,
	createAttributeSetFromMediaState,
	createAttributeSetFromPreset,
	createPresetFromAttributeSet,
	detectCircularReference,
	errorToString,
	includeAttributesByMediaState,
	pipe,
	removeOutterAttributesForSaving,
	replaceIds
} from 'utilities'

// ---- REDUCER --------

export const presetsReducer = (state, action) => { 
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.MOVE_SORTABLE_ELEMENT:
			return shared.moveSortableElement(state, payload)
		case ACTION.LOAD_PRESET_FOR_SAVING:
			return loadPresetForSaving(state, payload)
		case ACTION.LOAD_PRESETS_FOR_EDITING:
			return loadPresetsForEditing(state, payload)
		case ACTION.ADD_NEW_PRESET:
			return addNewPreset(state, payload)
		case ACTION.REMOVE_PRESET:
			return removePreset(state, payload)
		case ACTION.DUPLICATE_PRESET:
			return duplicatePreset(state, payload)
		case ACTION.SELECT_PRESET_BY_ID:
			return selectPresetById(state, payload)
		case ACTION.SELECT_PRESET_BY_INDEX:
			return selectPresetByIndex(state, payload)
		case ACTION.UPDATE_PRESET_STATE_BY_SELECTION:
			return updatePresetStateBySelection(state, payload)
		case ACTION.UPDATE_PRESET_STATE_BY_ID:
			return updatePresetStateById(state, payload)
		case ACTION.TOGGLE_PRESET_STATE:
			return togglePresetState(state, payload)
		case ACTION.TOGGLE_PRESET_LIMIT_TO:
			return togglePresetLimitTo(state, payload)
		case ACTION.UPDATE_PRESET_ATTRIBUTE:
			return updatePresetAttribute(state, payload)
		case ACTION.TOGGLE_PRESET_ATTRIBUTE:
			return togglePresetAttribute(state, payload)
		case ACTION.TOGGLE_ALL_PRESET_ATTRIBUTES:
			return toggleAllPresetAttributes(state, payload)
		case ACTION.ADD_PRESET_TO_BATCH:
			return addPresetToBatch(state, payload)
		case ACTION.MOVE_PRESET_IN_BATCH:
			return movePresetInBatch(state, payload)
		case ACTION.FLATTEN_BATCH_PRESET:
			return flattenBatchPreset(state, payload)
		case ACTION.CLEANUP_PRESETS_AND_SAVE:
			return cleanupPresetsAndSave(state, payload)
		case ACTION.CLOSE_PRESETS:
			return closePresets(state, payload)
		default:
			return state
	}
}

const loadPresetForSaving = (state, { mediaState }) => ({
	...state,
	presets: [
		pipe(
			createAttributeSetFromMediaState,
			removeOutterAttributesForSaving,
			includeAttributesByMediaState(mediaState)
		)(mediaState)
	]
})

const loadPresetsForEditing = (state, payload) => ({
	...state,
	...payload,
	presets: payload.presets.map((item, i) => createAttributeSetFromPreset({
		...item,
		presetNamePrepend: item.attributes.presetNamePrepend,
		presetNameAppend: item.attributes.presetNameAppend,
		attributes: item.attributes,
		focused: i === 0
	}))
})

const addNewPreset = (state, { element, offset = 0 }) => (
	shared.addSortableElement({
		...state,
		presets: state.presets.map(item => ({
			...item,
			focused: false
		}))
	}, {
		element: replaceIds(element),
		nest: 'presets',
    pos: offset
	})
)

const removePreset = (state, { id }) => {
	const len = state.presets.length

	if (len < 2) return { ...state, presets: [] }

	const presets = [...state.presets]
	const index = presets.findIndex(item => item.id === id)

	if (presets[index].focused) {
		const nextIndex = index + (index < len - 1 ? 1 : -1)
		presets[nextIndex].focused = true
	}

	return {
		...state,
		presets: presets
			.toSpliced(index, 1)
			.map(item => item.type === 'batchPreset' && item.presetIds.includes(id) ? {
				...item,
				presetIds: item.presetIds.filter(presetId => presetId !== id)
			} : item)
	}
}

const duplicatePreset = (state, { index }) => ({
	...state,
	presets: state.presets.toSpliced(index, 0, {
		...replaceIds(state.presets[index]),
		focused: false
	})
})

const selectPresetById = (state, { id }) => ({
	...state,
	presets: state.presets.map(item => ({
		...item,
		focused: item.id === id
	}))
})

const selectPresetByIndex = (state, { index }) => {
	if (index < 0) {
		index = state.presets.length - 1
	} else if (index >= state.presets.length) {
		index = 0
	}

	return ({
		...state,
		presets: state.presets.map((item, i) => ({
			...item,
			focused: i === index
		}))
	})
}

const updatePresetStateBySelection = (state, { properties }) => ({
	...state,
	presets: state.presets.map(item => item.focused ? ({
		...item,
		...properties
	}) : item)
})

const updatePresetStateById = (state, { id, properties }) => ({
	...state,
	presets: state.presets.map(item => item.id === id ? ({
		...item,
		...properties
	}) : item)
})

const togglePresetState = (state, { property }) => ({
	...state,
	presets: state.presets.map(item => item.focused ? ({
		...item,
		[property]: !item[property]
	}) : item)
})

const togglePresetLimitTo = (state, { mediaType }) => ({
	...state,
	presets: state.presets.map(item => item.focused ? {
		...item,
		limitTo: item.limitTo.includes(mediaType)
			? item.limitTo.filter(val => val !== mediaType)
			: [...item.limitTo, mediaType].toSorted()
	} : item)
})

const editAttribute = (state, attribute, callback) => ({
  ...state,
	presets: state.presets.map(item => item.focused ? ({
		...item,
		attributes: item.attributes.map(attr => attr.attribute === attribute ? callback(attr) : attr)
	}) : item)
})

const togglePresetAttribute = (state, { attribute, key = 'value' }) => editAttribute(state, attribute, attr => ({
	...attr,
	[key]: !attr[key]
}))

const toggleAllPresetAttributes = (state, { checked }) => ({
	...state,
	presets: state.presets.map(item => item.focused ? ({
		...item,
		attributes: item.attributes.map(attr => ({
			...attr,
			include: checked
		}))
	}) : item)
})

const updatePresetAttribute = (state, { attribute, value }) => editAttribute(state, attribute, attr => ({
	...attr,
	value
}))

const addPresetToBatch = (state, { index, batchPresetId, presetId }) => {
	if (detectCircularReference(state.presets, batchPresetId, presetId)) {
		toastr.error(
			'A batch preset cannot reference itself nor any batch presets that reference it.',
			'Circular Reference!',
			TOASTR_OPTIONS
		)

		return state
	}

	return {
		...state,
		presets: state.presets.map(item => item.id === batchPresetId ? {
			...item,
			presetIds: item.presetIds.toSpliced(index, 0, presetId)
		} : item)
	}
}

const movePresetInBatch = (state, payload) => ({
	...state,
	presets: state.presets.map(item => item.focused ? {
		...shared.moveSortableElement(item, {
			...payload,
			nest: 'presetIds',
		})
	} : item)
})

const flattenBatchPreset = (state, { parentId, childId }) => ({
	...state,
	presets: state.presets.map(item => item.id === parentId ? ({
		...item,
		presetIds: item.presetIds.toSpliced(
			item.presetIds.indexOf(childId),
			1,
			...state.presets.find(({ id }) => id === childId).presetIds
		)
	}) : item)
})

const savePresets = async (presets, callback) => {
	try {
		await window.ABLE2.interop.savePresets(presets)
		callback?.()
	} catch (err) {
		toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}
}

const cleanupPresetsAndSave = (state, { callback }) => {
	let nextState = { ...state }

	if (nextState.presets.some(({ label }) => !label)) {
		let presetCount = arrayCount(nextState.presets, ({ label, type }) => label && type === 'preset') + 1
		let batchPresetCount = arrayCount(nextState.presets, ({ label, type }) => label && type === 'batchPreset') + 1

		nextState = {
			...nextState,
			presets: nextState.presets.map(item => item.label ? item : {
				...item,
				label: item.type === 'batchPreset' ? `Batch Preset ${batchPresetCount++}` : `Preset ${presetCount++}`
			})
		}
	}

	savePresets({
		...nextState,
		presets: nextState.presets.map(attributeSet => createPresetFromAttributeSet(attributeSet))
	}, callback)

	return nextState
}

const closePresets = (state, { callback }) => {
	callback({
		...state,
		presets: state.presets.map(attributeSet => createPresetFromAttributeSet(attributeSet))
	})

	return state
}
