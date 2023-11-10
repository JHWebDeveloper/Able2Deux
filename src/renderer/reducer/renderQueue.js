import { ACTION } from 'constants'

import { updateState, updateMediaStateById } from './shared'

export const renderQueueReducer = (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return updateState(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_ID:
			return updateMediaStateById(state, payload)
		default:
			return state
	}
}
