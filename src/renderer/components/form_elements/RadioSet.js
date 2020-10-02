import React from 'react'
import { string, func, arrayOf, shape, bool } from 'prop-types'
import { v1 as uuid } from 'uuid'

// eslint-disable-next-line no-extra-parens
const RadioSet = ({ name, state, onChange, buttons }) => (
	buttons.map(({ label, value, omit }) => omit || (
		<label key={uuid()}>
			<input
				type="radio"
				name={name}
				value={value}
				checked={state === value}
				onChange={onChange} />
			<span>{label}</span>
		</label>
	))
)

RadioSet.propTypes = {
	name: string.isRequired,
	state: string.isRequired,
	onChange: func.isRequired,
	buttons: arrayOf(shape({
		label: string.isRequired,
		value: string,
		omit: bool
	})).isRequired
}

export default RadioSet
