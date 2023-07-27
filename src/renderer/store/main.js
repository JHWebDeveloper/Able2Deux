import React, { createContext, useContext, useEffect } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { PrefsProvider, PrefsContext } from 'store'

import { mainReducer as reducer } from 'reducer'
import { updateState } from 'actions'
import { useAugmentedDispatch } from 'hooks'
import { extractDefaultPrefs, pipe } from 'utilities'

const initState = {
	optimize: 'quality',
	screenshot: false,
	timer: 60,
	timerEnabled: false,
	media: [],
	batchName: '',
	batchNameType: 'replace',
	previewQuality: 1,
	previewHeight: 540,
	rendering: false
}

export const MainContext = createContext()

const MainProviderWithDefaultPrefs = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)
	const { preferences } = useContext(PrefsContext)

	useEffect(() => {
		pipe(extractDefaultPrefs, updateState, dispatch)(preferences)
	}, [preferences])

	return (
		<MainContext.Provider value={{
			...state,
			dispatch
		}}>
			{ children }
		</MainContext.Provider>
	)
}

export const MainProvider = ({ children }) => (
	<PrefsProvider>
		<MainProviderWithDefaultPrefs>
			{ children }
		</MainProviderWithDefaultPrefs>
	</PrefsProvider>
)

const providerPropTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}

MainProviderWithDefaultPrefs.propTypes = providerPropTypes
MainProvider.propTypes = providerPropTypes
