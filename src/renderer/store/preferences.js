import React, { createContext, useEffect } from 'react'
import toastr from 'toastr'
import { arrayOf, bool, element, oneOfType } from 'prop-types'

import { prefsReducer as reducer } from 'reducer'
import { updateState } from 'actions'
import { useAugmentedDispatch } from 'hooks'
import { TOASTR_OPTIONS } from 'utilities'

const { interop } = window.ABLE2

const initState = {
	version: 12,
	theme: 'system',
	scratchDisk: {
		imports: '',
		exports: '',
		previews: ''
	},
	warnings: {
		remove: true,
		removeReferenced: true,
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
	replaceSpaces: false,
	spaceReplacement: '_',
	convertCase: false,
	casing: 'lowercase',
	batchNameSeparator: ' ',
	concurrent: 2,
	saveLocations: [],
	disableRateLimit: false
}

export const PrefsContext = createContext()

export const PrefsProvider = ({ enableSync, children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	useEffect(() => {
		(async () => {
			try {
				dispatch(updateState(await interop.requestPrefs()))
			} catch (err) {
				toastr.error(err, false, TOASTR_OPTIONS)
			}
		})()

		if (!enableSync) return

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
			{children}
		</PrefsContext.Provider>
	)
}

PrefsProvider.propTypes = {
	enableSync: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}
