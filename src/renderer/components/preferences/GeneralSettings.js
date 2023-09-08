import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import { updateStateFromEvent, toggleWarning } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import ScratchDisk from './ScratchDisk'
import Checkbox from '../form_elements/Checkbox'

const THEME_BUTTONS = Object.freeze([
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

const GeneralSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { warnings } = preferences

	const dispatchToggleWarning = useCallback(e => {
		dispatch(toggleWarning(e))
	}, [])

	return (
		<form>
			<fieldset className="radio-set">
				<legend>Theme:</legend>
				<RadioSet
					name="theme"
					state={preferences.theme}
					onChange={e => dispatch(updateStateFromEvent(e))}
					buttons={THEME_BUTTONS} />
			</fieldset>
			<ScratchDisk
				scratchDisk={preferences.scratchDisk}
				dispatch={dispatch} />
			<fieldset className="radio-set">
				<legend>Warnings:</legend>
				<Checkbox
					label="Remove Media"
					name="remove"
					checked={warnings.remove}
					onChange={dispatchToggleWarning}
					switchIcon />
				<Checkbox
					label="Remove Referenced Media"
					name="removeReferenced"
					checked={warnings.removeReferenced}
					onChange={dispatchToggleWarning}
					switchIcon />
				<Checkbox
					label="Remove All/Selected Media"
					name="removeAll"
					checked={warnings.removeAll}
					onChange={dispatchToggleWarning}
					switchIcon />
				<Checkbox
					label="Apply Settings to All/Selected"
					name="applyToAll"
					checked={warnings.applyToAll}
					onChange={dispatchToggleWarning}
					switchIcon />
				<Checkbox
					label="Source on Top"
					name="sourceOnTop"
					checked={warnings.sourceOnTop}
					onChange={dispatchToggleWarning}
					switchIcon />
				<Checkbox
					label="Start Over"
					name="startOver"
					checked={warnings.startOver}
					onChange={dispatchToggleWarning}
					switchIcon />
			</fieldset>
		</form>
	)
}

export default GeneralSettings
