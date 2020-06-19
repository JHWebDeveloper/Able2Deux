import React, { useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import { updateStateFromEvent, toggleCheckbox, toggleNestedCheckbox } from '../../actions'

import { keepInRange } from '../../utilities'

import Checkbox from '../form_elements/Checkbox'

const Defaults = ({ warnings, editAll, scaleSliderMax, gridColor, dispatch }) => {
	const keepScaleMaxInRange = useCallback(e => {
		dispatch(updateStateFromEvent(keepInRange(e)))
	}, [])

	const toggleWarning = useCallback(e => {
		dispatch(toggleNestedCheckbox('warnings', e))
	}, [])

	return (
		<div id="defaults">
			<fieldset>
				<legend>Warnings and Defaults</legend>
				<div>
					<Checkbox
						label="Remove Warning"
						name="remove"
						checked={warnings.remove}
						onChange={toggleWarning}
						switchIcon />
					<Checkbox
						label="Remove All Warning"
						name="removeAll"
						checked={warnings.removeAll}
						onChange={toggleWarning}
						switchIcon />
					<Checkbox
						label="Apply to All Warning"
						name="applyToAll"
						checked={warnings.applyToAll}
						onChange={toggleWarning}
						switchIcon />
					<Checkbox
						label="Source on Top Warning"
						name="sourceOnTop"
						checked={warnings.sourceOnTop}
						onChange={toggleWarning}
						switchIcon />
					<Checkbox
						label="Edit All by Default"
						name="editAll"
						checked={editAll}
						onChange={e => dispatch(toggleCheckbox(e))}
						switchIcon />
					<span className="input-option">
						<label htmlFor="scaleSliderMax">Scale Max</label>
						<input
							type="number"
							name="scaleSliderMax"
							id="scaleSliderMax"
							value={scaleSliderMax}
							onChange={e => dispatch(updateStateFromEvent(e))}
							min={100}
							max={9999}
							onBlur={keepScaleMaxInRange}
							data-number />
					</span>
					<span className="input-option">
						<label htmlFor="gird-color">Grid Color</label>
						<input
							type="color"
							name="gridColor"
							id="grid-color"
							value={gridColor}
							onChange={e => dispatch(updateStateFromEvent(e))} />
					</span>
				</div>
			</fieldset>
		</div>
	)
}

Defaults.propTypes = {
	warnings: exact({
		remove: bool,
		removeAll: bool,
		applyToAll: bool,
		sourceOnTop: bool
	}).isRequired,
	editAll: bool.isRequired,
	scaleSliderMax: number.isRequired,
	gridColor: string.isRequired,
	dispatch: func.isRequired
}

export default Defaults
