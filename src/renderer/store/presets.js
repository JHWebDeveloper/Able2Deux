import React, { createContext, useEffect, useState } from 'react'
import toastr from 'toastr'
import { arrayOf, bool, element, func, oneOfType } from 'prop-types'

import { presetsReducer as reducer } from 'reducer'
import { updateState } from 'actions'
import { INIT_PRESETS_STATE, TOASTR_OPTIONS } from 'constants'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

export const PresetsContext = createContext()

export const PresetsProvider = ({ loadAction = updateState, referencesOnly, presorted, enableSync, children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, INIT_PRESETS_STATE)
	const [ presetsLoaded, setPresetsLoaded ] = useState(false)

	useEffect(() => {
		(async () => {
			try {
				dispatch(loadAction(await interop.requestPresets(referencesOnly, presorted)))
				setPresetsLoaded(true)
			} catch (err) {
				toastr.error(err, false, TOASTR_OPTIONS)
			}
		})()

		if (!enableSync) return

		interop.addPresetsSyncListener(newPresets => {
			dispatch(loadAction(newPresets))
		})

		return interop.removePresetsSyncListener
	}, [])

	return (
		<PresetsContext.Provider value={{
			presets: state,
			presetsLoaded,
			dispatch
		}}>
			{ children }
		</PresetsContext.Provider>
	)
}

PresetsProvider.propTypes = {
	loadAction: func,
	referencesOnly: bool,
	presorted: bool,
	enableSync: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}
