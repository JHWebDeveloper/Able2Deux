import React, { createContext, useEffect, useReducer } from 'react'
import { arrayOf, element, exact, oneOfType, object, bool } from 'prop-types'

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
	copiedSettings: {}
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
		editAll: bool.isRequired
	})
}
