import { useCallback, useContext } from 'react'

import { PanelsContext } from 'store'
import { togglePanelOpen } from 'actions'

export const usePanelToggle = panelName => {
	const { [panelName]: { open }, dispatch } = useContext(PanelsContext)

	const togglePanel = useCallback(() => {
		dispatch(togglePanelOpen(panelName))
	}, [panelName])

	return [ open, togglePanel ]
}
