import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import { toggleNestedCheckbox } from 'actions'

import Checkbox from '../form_elements/Checkbox'

const Warnings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { warnings } = preferences

	const toggleWarning = useCallback(e => {
		dispatch(toggleNestedCheckbox('warnings', e))
	}, [])

	return (
		<form>
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
		</form>
	)
}

export default Warnings
