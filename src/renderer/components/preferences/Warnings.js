import React, { useCallback } from 'react'
import { bool, exact, func } from 'prop-types'

import { toggleNestedCheckbox } from 'actions'

import PrefsPanel from './PrefsPanel'
import Checkbox from '../form_elements/Checkbox'

const Warnings = ({ warnings, dispatch }) => {
	const toggleWarning = useCallback(e => {
		dispatch(toggleNestedCheckbox('warnings', e))
	}, [])

	return (
		<PrefsPanel title="Warnings" className="span-1_3">
			<Checkbox
				label="Remove"
				name="remove"
				checked={warnings.remove}
				onChange={toggleWarning}
				switchIcon />
			<Checkbox
				label="Remove All"
				name="removeAll"
				checked={warnings.removeAll}
				onChange={toggleWarning}
				switchIcon />
			<Checkbox
				label="Apply to All"
				name="applyToAll"
				checked={warnings.applyToAll}
				onChange={toggleWarning}
				switchIcon />
			<Checkbox
				label="Source on Top"
				name="sourceOnTop"
				checked={warnings.sourceOnTop}
				onChange={toggleWarning}
				switchIcon />
			<Checkbox
				label="Start Over"
				name="startOver"
				checked={warnings.startOver}
				onChange={toggleWarning}
				switchIcon />
		</PrefsPanel>
	)
}

Warnings.propTypes = {
	warnings: exact({
		remove: bool,
		removeAll: bool,
		applyToAll: bool,
		sourceOnTop: bool,
		startOver: bool
	}).isRequired,
	dispatch: func.isRequired
}

export default Warnings
