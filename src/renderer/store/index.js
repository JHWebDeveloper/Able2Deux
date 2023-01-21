import React, { createContext, useEffect, useReducer } from 'react'
import { arrayOf, bool, element, exact, number, oneOf, oneOfType, object } from 'prop-types'

import { updateState } from 'actions'
import reducer from '../reducer'

const initState = {
	url: '',
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

export const MainContext = createContext()

export const MainProvider = ({ children, prefs }) => {
	const [ state, dispatch ] = useReducer(reducer, initState)

	const augDispatch = input => input instanceof Function ? input(dispatch, state) : dispatch(input)

	useEffect(() => {
		dispatch(updateState({ ...prefs }))
	}, [prefs])

	return (
		<MainContext.Provider value={{
			...state,
			dispatch: augDispatch
		}}>
			{ children }
		</MainContext.Provider>
	)
}

MainProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired,
	prefs: exact({
		saveLocations: arrayOf(object),
		editAll: bool,
		split: number,
		optimize: oneOf(['quality', 'download']),
		screenshot: bool,
		timerEnabled: bool,
		timer: number,
		previewQuality: number,
		aspectRatioMarkers: arrayOf(object).isRequired
	})
}
