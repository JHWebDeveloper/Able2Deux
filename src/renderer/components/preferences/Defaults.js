import React, { useCallback } from 'react'

import {
	updateState,
	updateStateFromEvent,
	toggleNestedCheckbox
} from '../../actions'

import { keepInRange } from '../../utilities'

import Checkbox from '../form_elements/Checkbox'

const Defaults = ({ warnings, scaleSliderMax, gridColor, dispatch }) => {
	const keepScaleMaxInRange = useCallback(e => {
		keepInRange(val => dispatch(updateState({
			scaleSliderMax: val
		})), e)
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
					<span className="input-option">
						<label htmlFor="scaleSliderMac">Scale Max</label>
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

export default Defaults
