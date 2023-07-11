import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import { updateStateFromEvent, toggleWarning } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import ScratchDisk from './ScratchDisk'
import Checkbox from '../form_elements/Checkbox'

const themeButtons = [
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
]

const GeneralSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { warnings } = preferences

	const dispatchToggleWarning = useCallback(e => {
		dispatch(toggleWarning(e))
	}, [])

	return (
		<form>
			<fieldset>
				<legend>Theme:</legend>
				<RadioSet
					name="theme"
					state={preferences.theme}
					onChange={e => dispatch(updateStateFromEvent(e))}
					buttons={themeButtons} />
			</fieldset>
			<ScratchDisk
				scratchDisk={preferences.scratchDisk}
				dispatch={dispatch} />
			<fieldset>
				<legend>Warnings:</legend>
				<span className="input-option">
					<Checkbox
						label="Remove Media"
						name="remove"
						checked={warnings.remove}
						onChange={dispatchToggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Remove Referenced Media"
						name="removeReferenced"
						checked={warnings.removeReferenced}
						onChange={dispatchToggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Remove All Media"
						name="removeAll"
						checked={warnings.removeAll}
						onChange={dispatchToggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Apply to All"
						name="applyToAll"
						checked={warnings.applyToAll}
						onChange={dispatchToggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Source on Top"
						name="sourceOnTop"
						checked={warnings.sourceOnTop}
						onChange={dispatchToggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Start Over"
						name="startOver"
						checked={warnings.startOver}
						onChange={dispatchToggleWarning}
						switchIcon />
				</span>
			</fieldset>
		</form>
	)
}

export default GeneralSettings
