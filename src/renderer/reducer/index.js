import * as ACTION from '../actions/types'
import * as STATUS from '../status/types'
import * as shared from './shared'

// ---- REDUCER --------

export default (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX:
			return toggleCheckbox(state, payload)
		case ACTION.UPDATE_NESTED_STATE:
			return shared.updateNestedState(state, payload)
		case ACTION.TOGGLE_NESTED_CHECKBOX:
			return shared.toggleNestedCheckbox(state, payload)
		case ACTION.UPDATE_MEDIA_STATE:
			return updateMediaState(state, payload)
		case ACTION.UPDATE_MEDIA_NESTED_STATE:
			return updateMediaNestedState(state, payload)
		case ACTION.TOGGLE_MEDIA_NESTED_CHECKBOX: 
			return toggleMediaNestedCheckbox(state, payload)
		case ACTION.ADD_MEDIA:
			return addMedia(state, payload)
		case ACTION.DUPLICATE_MEDIA: 
			return duplicateMedia(state, payload)
		case ACTION.REMOVE_MEDIA:
			return removeMedia(state, payload)
		case ACTION.PREPARE_MEDIA_FOR_FORMAT:
			return prepareMediaForFormat(state)
		case ACTION.PASTE_SETTINGS:
			return pasteSettings(state, payload)
		case ACTION.APPLY_TO_ALL:
			return applyToAll(state, payload)
		case ACTION.TOGGLE_SAVE_LOCATION:
			return shared.toggleSaveLocation(state, payload)
		default:
			return state
	}
}

// ---- "REACTIONS" --------

const toggleCheckbox = (state, payload) => ({
	...state,
	[payload.property]: !state[payload.property]
})

const updateMediaState = (state, payload) => {
	const { id, properties, editAll } = payload

	return {
		...state,
		media: state.media.map(item => item.id === id ? {
			...item,
			...properties
		}: item, editAll)
	}
}

const updateMediaNestedState = (state, payload) => {
	const { id, nest, properties, editAll } = payload

	return {
		...state,
		media: state.media.map(item => item.id == id ? {
			...item,
			[nest]: {
				...item[nest],
				...properties
			}
		}: item, editAll)
	}
}

const toggleMediaNestedCheckbox = (state, payload) => {
	const { id, nest, property, editAll } = payload

	return {
		...state,
		media: state.media.map(item => item.id === id ? {
			...item,
			[nest]: {
				...item[nest],
				[property]: !item[nest][property]
			}
		} : item, editAll)
	}
}

const addMedia = (state, payload) => ({
	...state,
	media: [payload.newMedia].concat(state.media)
})

const duplicateMedia = (state, payload) => {
	const index = state.media.findIndex(item => item.id === payload.id)
	const media = [...state.media]

	media.splice(index, 0, {
		...media[index],
		id: payload.newId
	})

	return { ...state, media }
}

const removeMedia = (state, payload) => ({
	...state,
	media: state.media.filter(item => item.id !== payload.id)
})

const prepareMediaForFormat = state => {
	const media = state.media.filter(item => item.status !== STATUS.FAILED)

	return {
		...state,
		media,
		selectedId: media[0].id
	}
}

const pasteSettings = (state, payload) => ({
	...state,
	media: updateMedia(payload.id, item => ({
		...item,
		...state.copiedSettings
	}))
})

const applyToAll = (state, payload) => ({
	...state,
	media: state.media.map(item => item.id !== payload.id ? {
		...item,
		...payload.properties
	} : item)
})
