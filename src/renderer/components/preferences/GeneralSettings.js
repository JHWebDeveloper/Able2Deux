import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import { updateStateFromEvent, toggleNestedCheckbox } from 'actions'

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

const Warnings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { warnings } = preferences

	const toggleWarning = useCallback(e => {
		dispatch(toggleNestedCheckbox('warnings', e))
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
						label="Remove"
						name="remove"
						checked={warnings.remove}
						onChange={toggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Remove All"
						name="removeAll"
						checked={warnings.removeAll}
						onChange={toggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Apply to All"
						name="applyToAll"
						checked={warnings.applyToAll}
						onChange={toggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Source on Top"
						name="sourceOnTop"
						checked={warnings.sourceOnTop}
						onChange={toggleWarning}
						switchIcon />
				</span>
				<span className="input-option">
					<Checkbox
						label="Start Over"
						name="startOver"
						checked={warnings.startOver}
						onChange={toggleWarning}
						switchIcon />
				</span>
			</fieldset>
		</form>
	)
}

export default Warnings
