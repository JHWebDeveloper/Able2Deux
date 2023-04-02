import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { PrefsProvider, PrefsContext } from 'store/preferences'

import reducer from 'reducer'
import { updateState } from 'actions'
import { objectExtract } from 'utilities'

const initState = {
	optimize: 'quality',
	screenshot: false,
	timer: 60,
	timerEnabled: false,
	media: [],
	selectedId: '',
	batch: {
		name: '',
		position: 'replace'
	},
	editAll: false,
	copiedSettings: {},
	previewQuality: 1,
	previewHeight: 540,
	rendering: false
}

const extractPrefsForMainState = (() => {
	const defaults = ['saveLocations', 'editAll', 'split', 'optimize', 'timerEnabled', 'timer', 'screenshot', 'previewQuality', 'previewHeight', 'aspectRatioMarkers']

	return obj => objectExtract(obj, defaults)
})()

export const MainContext = createContext()

const MainProviderWithPrefs = ({ children }) => {
	const [ state, dispatch ] = useReducer(reducer, initState)
	const { preferences } = useContext(PrefsContext)

	const augDispatch = input => input instanceof Function ? input(dispatch, state) : dispatch(input)

	useEffect(() => {
		dispatch(updateState(extractPrefsForMainState(preferences)))
	}, [preferences])

	return (
		<MainContext.Provider value={{
			...state,
			dispatch: augDispatch
		}}>
			{ children }
		</MainContext.Provider>
	)
}

export const MainProvider = ({ children }) => (
	<PrefsProvider>
		<MainProviderWithPrefs>
			{ children }
		</MainProviderWithPrefs>
	</PrefsProvider>
)

const providerPropTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}

MainProviderWithPrefs.propTypes = providerPropTypes
MainProvider.propTypes = providerPropTypes
