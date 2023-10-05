import React, { createContext, useEffect } from 'react'
import toastr from 'toastr'
import { arrayOf, bool, element, oneOfType } from 'prop-types'

import { presetsReducer as reducer } from 'reducer'
import { updateState } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

const initState = {
	version: 1,
	presets: [],
	batchPresets: []
}

export const PresetsContext = createContext()

export const PresetsProvider = ({ loadAction = updateState, referencesOnly, presorted, enableSync, children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	useEffect(() => {
		(async () => {
			try {
				dispatch(loadAction(await interop.requestPresets(referencesOnly, presorted)))
			} catch (err) {
				toastr.error(err, false, TOASTR_OPTIONS)
			}
		})()

		if (!enableSync) return

		interop.addPresetsSyncListener(newPresets => {
			dispatch(loadAction(newPresets))
		})

		return () => {
			interop.removePresetsSyncListener()
		}
	}, [])

	return (
		<PresetsContext.Provider value={{
			presets: state,
			dispatch
		}}>
			{ children }
		</PresetsContext.Provider>
	)
}

PresetsProvider.propTypes = {
	referencesOnly: bool,
	presorted: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}
