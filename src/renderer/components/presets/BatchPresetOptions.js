import React from 'react'
import { arrayOf, bool, func, oneOf, string } from 'prop-types'

import { MEDIA_TYPES, MEDIA_LABEL } from 'constants'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import RadioSet from '../form_elements/RadioSet'
import CheckboxSet from '../form_elements/CheckboxSet'
import Checkbox from '../form_elements/Checkbox'

const ATTRIBUTE_MERGE_TYPE_BUTTONS = Object.freeze([
	{
		label: 'Overwrite nested preset attributes.',
		value: 'overwrite'
	},
	{
		label: 'Supplement nested preset attributes.',
		value: 'fallback'
	}
])

const PRESET_NAME_MERGE_TYPE_BUTTONS = Object.freeze([
	{
		label: 'Overwrite',
		value: 'replace'
	},
	{
		label: 'Prepend',
		value: 'prepend'
	},
	{
		label: 'Append',
		value: 'append'
	}
])

const BatchPresetOptions = ({
	attributeMergeType,
	presetNamePrepend = '',
	presetNameAppend = '',
	presetNamePrependMergeType,
	presetNameAppendMergeType,
	limitToOverwrite,
	limitTo = [],
	updatePresetState,
	togglePresetState,
	toggleLimitTo
}) => (
	<div className="nav-panel-grid">
		<RadioSet
			label="Batch Preset Attributes"
			name="attributeMergeType"
			state={attributeMergeType}
			onChange={updatePresetState}
			buttons={ATTRIBUTE_MERGE_TYPE_BUTTONS} />
		<hr />
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
		<RadioSet
			label="Merge with Presets' Prepend to Filename"
			hideLabel
			name="presetNamePrependMergeType"
			horizontal
			state={presetNamePrependMergeType}
			onChange={updatePresetState}
			buttons={PRESET_NAME_MERGE_TYPE_BUTTONS} />
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
		<RadioSet
			label="Merge with Presets' Append to Filename"
			hideLabel
			name="presetNameAppendMergeType"
			horizontal
			state={presetNameAppendMergeType}
			onChange={updatePresetState}
			buttons={PRESET_NAME_MERGE_TYPE_BUTTONS} />
		<hr />
		<div className="overwrite-limit-to">
			<Checkbox
				name="limitToOverwrite"
				title={'Overwrite "Only Apply Preset To"'}
				checked={limitToOverwrite}
				onChange={togglePresetState}
				switchIcon />
			<CheckboxSet
				label="Only Apply Presets To"
				onChange={toggleLimitTo}
				disabled={!limitToOverwrite}
				options={MEDIA_TYPES.map((mediaType, i) => ({
					label: MEDIA_LABEL[i],
					name: mediaType,
					checked: limitTo.includes(mediaType)
				}))} />
		</div>
	</div>
)

BatchPresetOptions.propTypes = {
	attributeMergeType: oneOf(['overwrite', 'fallback']).isRequired,
	presetNamePrepend: string,
	presetNameAppend: string,
	presetNamePrependMergeType: oneOf(['replace', 'prepend', 'append']).isRequired,
	presetNameAppendMergeType: oneOf(['replace', 'prepend', 'append']).isRequired,
	limitToOverwrite: bool.isRequired,
	limitTo: arrayOf(oneOf(MEDIA_TYPES)).isRequired,
	updatePresetState: func.isRequired,
	togglePresetState: func.isRequired,
	toggleLimitTo: func.isRequired
}

export default BatchPresetOptions
