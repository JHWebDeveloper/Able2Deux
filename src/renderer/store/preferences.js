import React, { createContext, useEffect, useReducer } from 'react'
import toastr from 'toastr'
import { arrayOf, element, oneOfType } from 'prop-types'

import reducer from '../reducer/preferences'
import { updateState } from 'actions'
import { toastrOpts } from 'utilities'

const { interop } = window.ABLE2

const initState = {
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	autoPNG: true,
	asperaSafe: true,
	concurrent: 2,
	scratchDisk: {
		imports: '',
		exports: '',
		previews: ''
	},
	optimize: 'quality',
	screenRecorderFrameRate: 60,
	screenshot: false,
	timerEnabled: false,
	timer: 60,
	editAll: false,
	split: 270,
	enableWidescreenGrids: false,
	gridColor: '#ff00ff',
	scaleSliderMax: 400,
	disableRateLimit: false,
	warnings: {
		remove: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true
	},
	saveLocations: []
}

export const PrefsContext = createContext()

export const PrefsProvider = ({ children }) => {
	const [ state, dispatch ] = useReducer(reducer, initState)

	const augDispatch = input => input instanceof Function ? input(dispatch, state) : dispatch(input)

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
			preferences: state,
			dispatch: augDispatch
		}}>
			{ children }
		</PrefsContext.Provider>
	)
}

PrefsProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
