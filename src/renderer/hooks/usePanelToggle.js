import { useCallback, useContext } from 'react'

import { WorkspaceContext } from 'store'
import { updatePanelState } from 'actions'

export const usePanelToggle = panelName => {
	const { panels: { [panelName]: { open } }, dispatch } = useContext(WorkspaceContext)

	const togglePanel = useCallback(() => {
		dispatch(updatePanelState(panelName, !open))
	}, [panelName, open])

	return [ open, togglePanel ]
}
