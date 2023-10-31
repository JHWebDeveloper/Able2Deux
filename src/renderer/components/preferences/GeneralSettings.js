import React, { useCallback, useMemo, useContext } from 'react'

import { PrefsContext } from 'store'

import { updateStateFromEvent, toggleWarning } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import ScratchDisk from './ScratchDisk'
import CheckboxSet from '../form_elements/CheckboxSet'

const THEME_OPTIONS = Object.freeze([
	{
		label: 'System',
		value: 'system'
	},
	{
		label: 'Classic',
		value: 'light'
	},
	{
		label: 'Dark',
		value: 'dark'
	}
])

const createWarningOptions = warnings => [
	{
		label: 'Remove Media',
		name: 'remove',
		checked: warnings.remove
	},
	{
		label: 'Remove Referenced Media',
		name: 'removeReferenced',
		checked: warnings.removeReferenced
	},
	{
		label: 'Remove All/Selected Media',
		name: 'removeAll',
		checked: warnings.removeAll
	},
	{
		label: 'Apply Settings to All/Selected',
		name: 'applyToAll',
		checked: warnings.applyToAll
	},
	{
		label: 'Source on Top',
		name: 'sourceOnTop',
		checked: warnings.sourceOnTop
	},
	{
		label: 'Remove Preset',
		name: 'removePreset',
		checked: warnings.removePreset
	},
	{
		label: 'Remove Referenced Preset',
		name: 'removeReferencedPreset',
		checked: warnings.removeReferencedPreset
	},
	{
		label: 'Remove Preset from Batch Preset',
		name: 'removePresetFromBatch',
		checked: warnings.removePresetFromBatch
	},
	{
		label: 'Start Over',
		name: 'startOver',
		checked: warnings.startOver
	}
]

const GeneralSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { warnings } = preferences

	const dispatchToggleWarning = useCallback(e => {
		dispatch(toggleWarning(e))
	}, [])

	const warningOptions = useMemo(() => createWarningOptions(warnings), [warnings])

	return (
		<>
			<RadioSet
				label="Theme"
				name="theme"
				state={preferences.theme}
				onChange={e => dispatch(updateStateFromEvent(e))}
				options={THEME_OPTIONS} />
			<ScratchDisk
				scratchDisk={preferences.scratchDisk}
				dispatch={dispatch} />
			<CheckboxSet
				label="Warnings"
				onChange={dispatchToggleWarning}
				options={warningOptions} />
		</>
	)
}

export default GeneralSettings
