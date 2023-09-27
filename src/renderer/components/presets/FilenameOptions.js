import React, { useCallback } from 'react'
import { arrayOf, func, oneOf, string } from 'prop-types'

import { MEDIA_TYPES } from 'utilities'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import CheckboxSet from '../form_elements/CheckboxSet'

const MEDIA_LABEL = Object.freeze(['Audio', 'Motion Graphics', 'Images', 'Video'])

const FilenameOptions = ({ presetNamePrepend, presetNameAppend, limitTo, updateState, updateStateFromEvent }) => {
	const toggleLimitTo = useCallback(e => {
		const { name, checked } = e?.target || e

		updateState(currentState => ({
			...currentState,
			limitTo: !checked
				? currentState.limitTo.filter(mediaType => mediaType !== name)
				: [...currentState.limitTo, name].toSorted()
		}))
	}, [])

	const toggleSelectAllLimitTo = useCallback(e => {
		const { checked } = e?.target || e

		updateState(currentState => ({
			...currentState,
			limitTo: checked ? [...MEDIA_TYPES] : []
		}))
	}, [])

	return (
		<>
			<FieldsetWrapper label="Prepend to Filename">
				<input
					type="text"
					className="panel-input"
					name="presetNamePrepend"
					placeholder="If none, leave blank"
					maxLength={251}
					value={presetNamePrepend}
					onChange={updateStateFromEvent} />
			</FieldsetWrapper>
			<FieldsetWrapper label="Append to Filename">
				<input
					type="text"
					className="panel-input"
					name="presetNameAppend"
					placeholder="If none, leave blank"
					maxLength={251}
					value={presetNameAppend}
					onChange={updateStateFromEvent} />
			</FieldsetWrapper>
			<CheckboxSet
				label="Only Apply Presets To"
				onChange={toggleLimitTo}
				toggleSelectAll={toggleSelectAllLimitTo}
				checkboxes={MEDIA_TYPES.map((mediaType, i) => ({
					label: MEDIA_LABEL[i],
					name: mediaType,
					checked: limitTo.includes(mediaType)
				}))} />
		</>
	)
}

FilenameOptions.propTypes = {
	presetNamePrepend: string,
	presetNameAppend: string,
	limitTo: arrayOf(oneOf(['audio', 'gif', 'image', 'video'])),
	updateState: func.isRequired,
	updateStateFromEvent: func.isRequired
}

export default FilenameOptions
