import React, { useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import { updateState, updateStateFromEvent, toggleCheckbox, toggleNestedCheckbox } from 'actions'

import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'

const Defaults = ({ warnings, editAll, enableWidescreenGrids, gridColor, scaleSliderMax, dispatch }) => {
	const updateScaleMax = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
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
					<Checkbox
						label="Widescreen Grids"
						name="enableWidescreenGrids"
						checked={enableWidescreenGrids}
						onChange={e => dispatch(toggleCheckbox(e))}
						switchIcon />
					<span className="input-option">
						<label htmlFor="grid-color">Grid Color</label>
						<input
							type="color"
							name="gridColor"
							id="grid-color"
							value={gridColor}
							onChange={e => dispatch(updateStateFromEvent(e))} />
					</span>
					<span className="input-option">
						<label htmlFor="scaleSliderMax">Scale Max</label>
						<NumberInput
							name="scaleSliderMax"
							id="scaleSliderMax"
							value={scaleSliderMax}
							min={100}
							max={4500}
							onChange={updateScaleMax} />
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
	enableWidescreenGrids: bool.isRequired,
	gridColor: string.isRequired,
	scaleSliderMax: number.isRequired,
	dispatch: func.isRequired
}

export default Defaults
