import React from 'react'
import { arrayOf, bool, func, oneOf, string } from 'prop-types'

import { MEDIA_TYPES, MEDIA_LABEL } from 'constants'

import TextInputWithTokenInsertion from '../form_elements/TextInputWithTokenInsertion'
import CheckboxSet from '../form_elements/CheckboxSet'

const PresetOptions = ({
	presetNamePrepend = '',
	presetNameAppend = '',
	limitTo = [],
	updatePresetState,
	toggleLimitTo,
	hideLimitTo
}) => (
	<div className="nav-panel-grid">
		<TextInputWithTokenInsertion
			label="Prepend to Filename"
			name="presetNamePrepend"
			value={presetNamePrepend}
			maxLength={251}
			placeholder="If none, leave blank"
			onChange={updatePresetState}
			submenuAlignment="left top" />
		<TextInputWithTokenInsertion
			label="Append to Filename"
			name="presetNameAppend"
			value={presetNameAppend}
			maxLength={251}
			placeholder="If none, leave blank"
			onChange={updatePresetState}
			submenuAlignment="left top" />
		{hideLimitTo ? <></> : <>
			<hr />
			<CheckboxSet
				label="Only Apply Preset To"
				onChange={toggleLimitTo}
				options={MEDIA_TYPES.map((mediaType, i) => ({
					label: MEDIA_LABEL[i],
					name: mediaType,
					checked: limitTo.includes(mediaType)
				}))} />
		</>}
	</div>
)

PresetOptions.propTypes = {
	presetNamePrepend: string,
	presetNameAppend: string,
	limitTo: arrayOf(oneOf(MEDIA_TYPES)),
	updatePresetState: func.isRequired,
	hideLimitTo: bool,
	toggleLimitTo: func.isRequired
}

export default PresetOptions
