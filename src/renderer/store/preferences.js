import React, { createContext, useEffect, useReducer } from 'react'
import toastr from 'toastr'
import { arrayOf, element, oneOfType } from 'prop-types'

import reducer from '../reducer/preferences'
import { updateState } from 'actions'
import { toastrOpts } from 'utilities'

const { interop } = window.ABLE2

const initState = {
	version: 10,
	theme: 'system',
	scratchDisk: {
		imports: '',
		exports: '',
		previews: ''
	},
	warnings: {
		remove: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true,
		startOver: true
	},
	optimize: 'quality',
	screenshot: false,
	timerEnabled: false,
	screenRecorderFrameRate: 60,
	timer: 60,
	editorSettings: {
		arc: 'none',
		backgroundMotion: 'animated'
	},
	editAll: false,
	enable11pmBackgrounds: false,
	sliderSnapPoints: true,
	split: 270,
	scaleSliderMax: 400,
	previewQuality: 1,
	previewHeight: 540,
	gridColor: '#ff00ff',
	aspectRatioMarkers: [],
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	customFrameRate: 23.98,
	autoPNG: true,
	asperaSafe: true,
	concurrent: 2,
	saveLocations: [],
	disableRateLimit: false
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
