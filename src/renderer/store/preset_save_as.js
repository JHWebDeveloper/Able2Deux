import React, { createContext, useEffect } from 'react'
import toastr from 'toastr'

import { presetsReducer as reducer } from 'reducer'
import { loadPresetForSaving } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

const initState = {
	presets: []
}

export const PresetSaveAsContext = createContext()

export const PresetSaveAsProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	useEffect(() => {
		(async () => {
			try {
				const presetToSave = await interop.getPresetToSave()

				dispatch(loadPresetForSaving(presetToSave))
			} catch (err) {
				toastr.error(err, false, TOASTR_OPTIONS)
			}
		})()
	}, [])

	return (
		<PresetSaveAsContext.Provider value={{
			presets: state,
			dispatch
		}}>
			{ children }
		</PresetSaveAsContext.Provider>
	)
}