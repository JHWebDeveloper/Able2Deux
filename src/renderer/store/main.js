import React, { createContext } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { mainReducer as reducer } from 'reducer'
import { useAugmentedDispatch } from 'hooks'


const initState = {
	url: '',
	optimize: 'quality',
	screenshot: false,
	timer: 60,
	timerEnabled: false,
	clipboard: {},
	media: [],
	batchNameType: 'replace',
	batchName: '',
	batchNamePrepend: '',
	batchNameAppend: '',
	previewQuality: 1,
	previewHeight: 540,
	rendering: false
}

export const MainContext = createContext()

export const MainProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

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
