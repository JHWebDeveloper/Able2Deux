import * as ACTION from 'actions/types'

export const panelsReducer = (state, action) => {
  const { type, payload } = action

  switch (type) {
    case ACTION.TOGGLE_PANEL_OPEN:
      return {
        ...state,
        [payload.panelName]: {
          open: !state[payload.panelName].open
        }
      }
    default:
      return state
  }
}
