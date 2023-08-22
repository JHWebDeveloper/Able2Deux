import * as shared from 'reducer/shared'
import * as ACTION from 'actions/types'

// ---- REDUCER --------

export const presetsReducer = (state, action) => { 
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		default:
			return state
	}
}
