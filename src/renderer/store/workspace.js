import React, { createContext, useEffect, useContext } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { workspaceReducer as reducer } from 'reducer'
import { PrefsContext } from 'store'
import { updateState } from 'actions'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

const initState = {
	windowWidth: 830,
	windowHeight: 800,
	previewHeight: 540,
	previewQuality: 1,
	grid: true,
	aspectRatioMarkers: [],
	panels: {
		batchName: {
			open: false
		},
		preview: {
			open: true
		},
		fileOptions: {
			open: true
		},
		audio: {
			open: false
		},
		framing: {
			open: true
		},
		source: {
			open: true
		},
		centering: {
			open: true
		},
		position: {
			open: false
		},
		scale: {
			open: false
		},
		crop: {
			open: false
		},
		rotation: {
			open: false
		},
		keying: {
			open: false
		},
		colorCorrection: {
			open: false
		},
		presetNameTemplate: {
			open: false
		}
	}
}

export const WorkspaceContext = createContext()

export const WorkspaceProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)
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
