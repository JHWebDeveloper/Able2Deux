import React, { useCallback } from 'react'
import { arrayOf, bool, func, number, object, oneOfType, shape, string } from 'prop-types'

import {
	toggleIncludePresetAttribute,
	toggleAllPresetAttributes,
	togglePresetAttribute,
	updatePresetAttribute
} from 'actions'

import CheckboxSet from '../form_elements/CheckboxSet'
import SelectInput from '../form_elements/SelectInput'
import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import ColorInput from '../form_elements/ColorInput'

const AttributeInput = ({ inputType, attribute, value, onChange, onChangeToggle, disabled, constraints }) => {
	const commonAttributes = {
		name: attribute,
		value,
		onChange,
		disabled
	}

	if (Array.isArray(inputType)) {
		return (
			<SelectInput
				options={inputType}
				{...commonAttributes} />
		)
	}

	switch (inputType) {
		case 'number':
			return (
				<NumberInput
					{...commonAttributes}
					{...constraints} />
			)
		case 'boolean':
			return (
				<Checkbox
					name={attribute}
					checked={value}
					onChange={onChangeToggle}
					disabled={disabled} />
			)
		case 'color':
			return <ColorInput {...commonAttributes} />
		case 'text':
			return (
				<input
					type="text"
					className="panel-input"
					{...commonAttributes}
					{...constraints} />
			)
		default:
			return <></>
	}
}

const AttributeEditor = ({ attributes = [], dispatch }) => {
	const dispatchToggleAllPresetAttributes = useCallback(e => {
		const { checked } = e?.target || e
		dispatch(toggleAllPresetAttributes(checked))
	}, [])

	const dispatchToggleIncludePresetAttribute = useCallback(e => {
		const { name } = e?.target || e
		dispatch(toggleIncludePresetAttribute(name))
	}, [])

	const dispatchTogglePresetAttribute = useCallback(e => {
		const { name } = e?.target || e
		dispatch(togglePresetAttribute(name))
	}, [])

	const dispatchUpdatePresetAttribute = useCallback(e => {
		const { name, value } = e?.target || e
		dispatch(updatePresetAttribute(name, value))
	}, [])
	
	return (
		<div className="nav-panel-grid">
			<CheckboxSet
				label="Select and Set Preset Attributes"
				selectAllLabel="Enable All"
				hideLabel
				switchIcon
				onChange={dispatchToggleIncludePresetAttribute}
				toggleSelectAll={dispatchToggleAllPresetAttributes}
				options={attributes.map(item => ({
					label: item.label,
					name: item.attribute,
					checked: item.include,
					component: (
						<AttributeInput
							onChange={dispatchUpdatePresetAttribute}
							onChangeToggle={dispatchTogglePresetAttribute}
							disabled={!item.include}
							{...item} />
					)
				}))} />
		</div>
	)
}

const COMMON_PROP_TYPES = Object.freeze({
	inputType: string.isRequired,
	attribute: string.isRequired,
	value: oneOfType([bool, number, object, string]).isRequired,
	constraints: shape({
		min: number,
		max: number
	})
})

AttributeInput.propTypes = {
	...COMMON_PROP_TYPES,
	onChange: func.isRequired,
	onChangeToggle: func.isRequired,
	disabled: bool
}

AttributeEditor.propTypes = {
	attributes: arrayOf(shape(COMMON_PROP_TYPES)),
	dispatch: func.isRequired
}

export default AttributeEditor
