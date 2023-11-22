import React, { createContext, useContext, useEffect } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { workspaceReducer as reducer } from 'reducer'
import { PrefsContext } from 'store'
import { updateState } from 'actions'
import { INIT_WORKSPACE_STATE } from 'constants'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

export const WorkspaceContext = createContext()

export const WorkspaceProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, INIT_WORKSPACE_STATE)
	const { preferences: { aspectRatioMarkers }, prefsLoaded } = useContext(PrefsContext)

	useEffect(() => {
		if (!prefsLoaded) return

		(async () => {
			dispatch(updateState({
				...await interop.requestWorkspace(),
				aspectRatioMarkers
			}))
		})()
	}, [prefsLoaded, aspectRatioMarkers])

	return (
		<WorkspaceContext.Provider value={{
			...state,
			dispatch
		}}>
			{ children }
		</WorkspaceContext.Provider>
	)
}

WorkspaceProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
