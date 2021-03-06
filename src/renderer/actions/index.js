import * as ACTION from './types'

export * from './acquisition'
export * from './preferences'
export * from './formatting'

// ---- 1ST LEVEL STATE --------

export const updateState = payload => ({
	type: ACTION.UPDATE_STATE,
	payload
})

export const updateStateFromEvent = e => ({
	type: ACTION.UPDATE_STATE,
	payload: {
		[e.target.name]: e.target.value
	}
})

export const toggleCheckbox = e => ({
	type: ACTION.TOGGLE_CHECKBOX,
	payload: {
		property: e.target.name
	}
})

// ---- 2ND LEVEL STATE --------

export const updateNestedState = (nest, properties) => ({
	type: ACTION.UPDATE_NESTED_STATE,
	payload: {
		nest,
		properties
	}
})

export const updateNestedStateFromEvent = (nest, e) => ({
	type: ACTION.UPDATE_NESTED_STATE,
	payload: {
		nest,
		properties: {
			[e.target.name]: e.target.value
		}
	}
})

export const toggleNestedCheckbox = (nest, e) => ({
	type: ACTION.TOGGLE_NESTED_CHECKBOX,
	payload: {
		nest,
		property: e.target.name
	}
})


// ---- 3RD LEVEL STATE --------

export const updateMediaState = (id, properties, editAll) => ({
	type: ACTION.UPDATE_MEDIA_STATE,
	payload: {
		id,
		editAll,
		properties
	}
})

export const updateMediaStateFromEvent = (id, e, editAll) => ({
	type: ACTION.UPDATE_MEDIA_STATE,
	payload: {
		id,
		editAll,
		properties: {
			[e.target.name]: e.target.value
		}
	}
})


// ---- 4TH LEVEL STATE --------

export const updateMediaNestedState = (id, nest, properties, editAll) => ({
	type: ACTION.UPDATE_MEDIA_NESTED_STATE,
	payload: {
		id,
		nest,
		properties,
		editAll
	}
})

export const updateMediaNestedStateFromEvent = (id, nest, e, editAll) => ({
	type: ACTION.UPDATE_MEDIA_NESTED_STATE,
	payload: {
		id,
		nest,
		editAll,
		properties: {
			[e.target.name]: e.target.value
		}
	}
})

export const toggleMediaNestedCheckbox = (id, nest, e, editAll) => dispatch => {
	dispatch({
		type: ACTION.TOGGLE_MEDIA_NESTED_CHECKBOX,
		payload: {
			id,
			nest,
			property: e.target.name
		}
	})

	if (editAll) dispatch({
		type: ACTION.UPDATE_MEDIA_NESTED_STATE,
		payload: {
			id,
			nest,
			editAll,
			properties: {
				[e.target.name]: e.target.checked
			}
		}
	})
}
