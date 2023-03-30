import React, { useId } from 'react'
import { arrayOf, element, func, shape, string } from 'prop-types'

const RadioSet = ({ name, state, onChange, buttons = [] }) => {
	const setKey = useId

	return buttons.map(({ label, value, component }, i) => (
		<label key={`${setKey}_${i}`}>
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
	))
}

RadioSet.propTypes = {
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
