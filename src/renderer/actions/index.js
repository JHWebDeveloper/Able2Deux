import * as ACTION from 'actions/types'

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

export const addNewSortableElement = (nest, element, index, e) => dispatch => {
	const pos = e.shiftKey ? 1 : 0

	dispatch({
		type: ACTION.ADD_SORTABLE_ELEMENT,
		payload: {
			pos: index + pos,
			nest,
			element
		}
	})
}

export const removeSortableElement = (id, nest) => ({
	type: ACTION.REMOVE_SORTABLE_ELEMENT,
	payload: { id, nest }
})

export const moveSortableElement = (nest, oldPos, newPos) => ({
	type: ACTION.MOVE_SORTABLE_ELEMENT,
	payload: { nest, oldPos, newPos }
})

// ---- 3RD LEVEL STATE --------

export const updateMediaStateBySelection = properties => ({
	type: ACTION.UPDATE_MEDIA_STATE_BY_SELECTION,
	payload: {
		properties
	}
})

export const updateMediaStateBySelectionFromEvent = e => (
	updateMediaStateBySelection({
		[e.target.name]: e.target.value
	})
)

export const updateMediaStateById = (id, properties) => ({
	type: ACTION.UPDATE_MEDIA_STATE_BY_ID,
	payload: {
		id,
		properties
	}
})

export const updateMediaStateByIdFromEvent = (id, e) => (
	updateMediaStateById(id, {
		[e.target.name]: e.target.value
	})
)

export const toggleMediaCheckbox = (id, e) => ({
	type: ACTION.TOGGLE_MEDIA_CHECKBOX,
	payload: {
		id,
		property: e.target.name
	}
})
