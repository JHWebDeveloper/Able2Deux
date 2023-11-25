import React, { createContext, useEffect, useState } from 'react'
import toastr from 'toastr'
import { arrayOf, bool, element, oneOfType } from 'prop-types'

import { prefsReducer as reducer } from 'reducer'
import { updateState } from 'actions'
import { INIT_PREFS_STATE, TOASTR_OPTIONS } from 'constants'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

export const PrefsContext = createContext()

export const PrefsProvider = ({ enableSync, children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, INIT_PREFS_STATE)
	const [ prefsLoaded, setPrefsLoaded ] = useState(false)

	useEffect(() => {
		(async () => {
			try {
				dispatch(updateState(await interop.requestPrefs()))
				setPrefsLoaded(true)
			} catch (err) {
				toastr.error(err, false, TOASTR_OPTIONS)
			}
		})()

		if (!enableSync) return

		interop.addPrefsSyncListener(newPrefs => {
			dispatch(updateState(newPrefs))
		})

		return interop.removePrefsSyncListener
	}, [])

	return (
		<PrefsContext.Provider value={{
			preferences: state,
			prefsLoaded,
			dispatch
		}}>
			{ children }
		</PrefsContext.Provider>
	)
}

PrefsProvider.propTypes = {
	enableSync: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}
