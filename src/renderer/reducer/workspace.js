import { ACTION } from 'constants'
import * as shared from './shared'

export const workspaceReducer = (state, action) => {
	const { type, payload } = action

	switch (type) {
		case ACTION.UPDATE_STATE:
			return shared.updateState(state, payload)
		case ACTION.TOGGLE_CHECKBOX:
			return shared.toggleCheckbox(state, payload)
		case ACTION.TOGGLE_SORTABLE_ELEMENT_CHECKBOX:
			return shared.toggleSortableElementCheckbox(state, payload)
		case ACTION.UPDATE_PANEL_STATE:
			return updatePanelState(state, payload)
		default:
			return state
	}
}

const updatePanelState = (state, { panelName, open }) => ({
	...state,
	panels: {
		...state.panels,
		[panelName]: { open }
	}
})
