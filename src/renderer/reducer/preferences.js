import * as ACTION from '../actions/types'

export default (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return {
				...state,
				...payload
			}
		default:
			return state
	}
}
