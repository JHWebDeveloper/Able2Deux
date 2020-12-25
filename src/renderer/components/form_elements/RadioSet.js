import React, { useMemo } from 'react'
import { string, func, arrayOf, shape, bool } from 'prop-types'
import { v1 as uuid } from 'uuid'

const RadioSet = ({ name, state, onChange, buttons }) => {
	const setKey = useMemo(uuid, [])

	return buttons.map(({ label, value }, i) => (
		<label key={`${setKey}_${i}`}>
			<input
				type="radio"
				name={name}
				value={value}
				checked={state === value}
				onChange={onChange} />
			<span>{label}</span>
		</label>
	))
}

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
