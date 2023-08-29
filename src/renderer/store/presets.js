import React, { createContext, useEffect } from 'react'
import toastr from 'toastr'
import { arrayOf, bool, element, oneOfType } from 'prop-types'

import { presetsReducer as reducer } from 'reducer'
import { updateState } from 'actions'
import { useAugmentedDispatch } from 'hooks'
import { toastrOpts } from 'utilities'

const { interop } = window.ABLE2

const initState = {
	version: 1,
	presets: [],
	batchPresets: []
}

export const PresetsContext = createContext()

export const PresetsProvider = ({ referencesOnly, children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	useEffect(() => {
		(async () => {
			try {
				dispatch(updateState(await interop.requestPresets(referencesOnly)))
			} catch (err) {
				toastr.error(err, false, toastrOpts)
			}
		})()

		// interop.addPrefsSyncListener(newPrefs => {
		// 	dispatch(updateState(newPrefs))
		// })

		// return () => {
		// 	interop.removePrefsSyncListener()
		// }
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
	omitPresetAttributes: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}
