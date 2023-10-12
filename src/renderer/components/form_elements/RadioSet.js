import React, { useId } from 'react'
import { arrayOf, bool, element, func, shape, string } from 'prop-types'

import FieldsetWrapper from './FieldsetWrapper'

const RadioSet = ({ label, hideLabel, horizontal, disabled, name, state, onChange, buttons = [] }) => {
	const setKey = useId()

	return (
		<FieldsetWrapper
			label={label}
			className="radio-set"
			hideLabel={hideLabel}
			horizontal={horizontal}
			disabled={disabled}>
			{buttons.map(({ label, value, component }, i) => (
				<label
					key={`${setKey}_${i}`}
					className="label-with-input">
					<input
						type="radio"
						name={name}
						title={label}
						aria-label={label}
						value={value}
						checked={state === value}
						onChange={onChange} />
					{component || <span>{label}</span>}
				</label>
			))}
		</FieldsetWrapper>
	)
}

RadioSet.propTypes = {
	label: string.isRequired,
	hideLabel: bool,
	horizontal: bool,
	disabled: bool,
	name: string.isRequired,
	state: string.isRequired,
	onChange: func.isRequired,
	buttons: arrayOf(shape({
		label: string.isRequired,
		value: string.isRequired,
		component: element
	})).isRequired
}

export default RadioSet
