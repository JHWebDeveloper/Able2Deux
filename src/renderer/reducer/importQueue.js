import { ACTION } from 'constants'

import * as shared from './shared'

export const importQueueReducer = (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.UPDATE_MEDIA_STATE_BY_ID:
			return shared.updateMediaStateById(state, payload)
    case ACTION.ADD_SORTABLE_ELEMENT:
      return shared.addSortableElement(state, payload)
    case ACTION.REMOVE_SORTABLE_ELEMENT:
    case ACTION.REMOVE_MEDIA:
      return shared.removeSortableElement(state, payload)
    case ACTION.REMOVE_ALL_MEDIA:
      return shared.removeAllElements(state)
		default:
			return state
	}
}
