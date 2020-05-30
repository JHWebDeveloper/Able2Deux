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
					<fieldset name="scaleSliderMax">
						<legend>Scale Slider Max</legend>
						<input
							type="number"
							name="scaleSliderMax"
							value={scaleSliderMax}
							min="100"
							max="9999"
							data-number />
					</fieldset>
				</div>
			</fieldset>
		</div>
	)
}

export default Defaults
