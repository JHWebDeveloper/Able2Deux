import React, { createContext, useEffect, useReducer } from 'react'
import toastr from 'toastr'
import { arrayOf, element, oneOfType } from 'prop-types'

import reducer from '../reducer/preferences'
import { updateState } from '../actions'
import { toastrOpts } from '../utilities'

const { interop } = window.ABLE2

const initState = {
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	concurrent: 2,
	saveLocations: [],
	scratchDisk: {
		imports: '',
		exports: '',
		previews: ''
	},
	warnings: {
		remove: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true
	},
	editAll: false,
	enableWidescreenGrids: false,
	gridColor: '#ff00ff',
	scaleSliderMax: 400
}

export const PrefsContext = createContext()

export const PrefsProvider = ({ children }) => {
	const [ state, dispatch ] = useReducer(reducer, initState)

	useEffect(() => {
		(async () => {
			try {
				dispatch(updateState(await interop.requestPrefs()))
			} catch (err) {
				toastr.error('Unable to load preferences', false, toastrOpts)
			}
		})()

		interop.addPrefsSyncListener(newPrefs => {
			dispatch(updateState(newPrefs))
		})

		return () => {
			interop.removePrefsSyncListener()
		}
	}, [])

	return (
		<PrefsContext.Provider value={{
			...state,
			dispatch: input => (
				input instanceof Function ? input(dispatch, state) : dispatch(input)
			)
		}}>
			{ children }
		</PrefsContext.Provider>
	)
}

PrefsProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
