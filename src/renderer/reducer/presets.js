import * as shared from 'reducer/shared'
import * as ACTION from 'actions/types'

// ---- REDUCER --------

export const presetsReducer = (state, action) => { 
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.LOAD_PRESETS_FOR_EDITING:
			return loadPresetsForEditing(state, payload)
		default:
			return state
	}
}

const loadPresetsForEditing = (state, payload) => ({
	...state,
	...payload,
	presets: payload.presets.map((item, i) => ({
		...item,
		focused: i === 0
	}))
})
