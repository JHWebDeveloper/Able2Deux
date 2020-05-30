import React from 'react'

import Checkbox from '../form_elements/Checkbox'

const Defaults = ({ warnings, scaleSliderMax }) => {
	return (
		<div id="defaults">
			<fieldset>
				<legend>Warnings and Defaults</legend>
				<div>
					<Checkbox
						label="Remove Warning"
						name="remove"
						checked={warnings.remove}
						switchIcon />
					<Checkbox
						label="Remove All Warning"
						name="removeAll"
						checked={warnings.removeAll}
						switchIcon />
					<Checkbox
						label="Apply to All Warning"
						name="applyToAll"
						checked={warnings.applyToAll}
						switchIcon />
					<Checkbox
						label="Source on Top Warning"
						name="sourceOnTop"
						checked={warnings.sourceOnTop}
						switchIcon />
					<span className="number-selector">
						<label htmlFor="scaleSliderMac">Scale Slider Max</label>
						<input
							type="number"
							name="scaleSliderMax"
							id="scaleSliderMax"
							value={scaleSliderMax}
							min="100"
							max="9999"
							data-number />
					</span>
				</div>
			</fieldset>
		</div>
	)
}

export default Defaults
