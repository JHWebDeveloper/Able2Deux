import React, { createContext, useEffect } from 'react'
import toastr from 'toastr'
import { arrayOf, element, oneOfType } from 'prop-types'

import { prefsReducer as reducer } from 'reducer/preferences'
import { updateState } from 'actions'
import { useAugmentedDispatch } from 'hooks'
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
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	useEffect(() => {
		(async () => {
			try {
				dispatch(updateState(await interop.requestPrefs()))
			} catch (err) {
				toastr.error(err, false, toastrOpts)
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
			dispatch
		}}>
			{ children }
		</PrefsContext.Provider>
	)
}

PrefsProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
