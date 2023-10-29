import React from 'react'
import { arrayOf, func, oneOf, string } from 'prop-types'

import { MEDIA_TYPES, MEDIA_LABEL } from 'constants'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import CheckboxSet from '../form_elements/CheckboxSet'

const PresetOptions = ({
	presetNamePrepend = '',
	presetNameAppend = '',
	limitTo = [],
	updatePresetState,
	toggleLimitTo
}) => (
	<div className="nav-panel-grid">
		<FieldsetWrapper label="Prepend to Filename">
			<input
				type="text"
				className="panel-input"
				name="presetNamePrepend"
				placeholder="If none, leave blank"
				maxLength={251}
				value={presetNamePrepend}
				onChange={updatePresetState} />
		</FieldsetWrapper>
		<FieldsetWrapper label="Append to Filename">
			<input
				type="text"
				className="panel-input"
				name="presetNameAppend"
				placeholder="If none, leave blank"
				maxLength={251}
				value={presetNameAppend}
				onChange={updatePresetState} />
		</FieldsetWrapper>
		<hr />
		<CheckboxSet
			label="Only Apply Preset To"
			onChange={toggleLimitTo}
			checkboxes={MEDIA_TYPES.map((mediaType, i) => ({
				label: MEDIA_LABEL[i],
				name: mediaType,
				checked: limitTo.includes(mediaType)
			}))} />
	</div>
)

PresetOptions.propTypes = {
	presetNamePrepend: string,
	presetNameAppend: string,
	limitTo: arrayOf(oneOf(MEDIA_TYPES)),
	updatePresetState: func.isRequired,
	toggleLimitTo: func.isRequired
}

export default PresetOptions
