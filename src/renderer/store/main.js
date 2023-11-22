import React, { createContext, useContext, useEffect } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { mainReducer as reducer } from 'reducer'
import { PrefsContext } from 'store'
import { updateState } from 'actions'
import { useAugmentedDispatch } from 'hooks'
import { createObjectPicker, pipe } from 'utilities'

const INIT_STATE = Object.freeze({
	fixed: {
		clipboard: {}
	},
	url: '',
	optimize: 'quality',
	screenshot: false,
	timer: 60,
	timerEnabled: false,
	media: [],
	batchNameType: 'replace',
	batchName: '',
	batchNamePrepend: '',
	batchNameAppend: '',
	saveLocations: []
})

const extractDefaultPrefs = createObjectPicker([
	'saveLocations',
	'split',
	'optimize',
	'timerEnabled',
	'timer',
	'screenshot'
])

export const MainContext = createContext()

export const MainProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, INIT_STATE)
	const { preferences, prefsLoaded } = useContext(PrefsContext)
	const { aspectRatioMarkers, saveLocations } = preferences

	useEffect(() => {
		if (prefsLoaded) pipe(extractDefaultPrefs, updateState, dispatch)(preferences)
	}, [prefsLoaded, aspectRatioMarkers, saveLocations])

	return (
		<MainContext.Provider value={{
			...state,
			dispatch
		}}>
			{children}
		</MainContext.Provider>
	)
}

MainProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
