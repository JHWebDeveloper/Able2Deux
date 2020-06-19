import React, { createContext, useEffect, useReducer } from 'react'
import { arrayOf, element, exact, oneOfType, object, bool } from 'prop-types'

import { updateState } from '../actions'
import reducer from '../reducer'

const initState = {
	url: '',
	optimize: 'quality',
	recording: false,
	timer: {
		enabled: false,
		tc: 60,
		display: '00:01:00'
	},
	media: [],
	selectedId: false,
	batchName: '',
	editAll: false,
	copiedSettings: {}
}

export const MainContext = createContext()

export const MainProvider = ({ children, prefs }) => {
	const [ state, dispatch ] = useReducer(reducer, initState)

	useEffect(() => {
		dispatch(updateState({ ...prefs }))
	}, [prefs])

	return (
		<MainContext.Provider value={{
			...state,
			dispatch: input => (
				input instanceof Function ? input(dispatch, state) : dispatch(input)
			)
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
