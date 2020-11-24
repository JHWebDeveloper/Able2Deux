import React, { useCallback } from 'react'

import { keepInRange } from 'utilities'
import { parse } from 'uuid'

const fineTuneOn = e => {
	if (e.shiftKey) e.target.step = 0.05
}

const fineTuneOff = e => {
	e.target.step = 1
}

const NumberInput = ({
	name,
	title,
	value = 0,
	defaultValue = 0,
	min = 0,
	max = 100,
	onChange
}) => {
	const onChangeParse = useCallback(e => {
		let { name, value } = e.target

		onChange({
			name,
			value: value === '' ? value : parseFloat(value)
		})
	}, [onChange])

	const onBlurParse = useCallback(e => onChange({
		name: e.target.name,
		value: keepInRange(e)
	}), [onChange])

	return (
		<input
			type="number"
			name={name}
			title={title}
			value={value}
			min={min}
			max={max}
			step={1}
			onChange={onChangeParse}
			onClick={e => e.currentTarget.select()}
			onBlur={onBlurParse}
			onKeyDown={fineTuneOn}
			onKeyUp={fineTuneOff}
			data-default-value={defaultValue}
			data-number />
	)
}

export default NumberInput
