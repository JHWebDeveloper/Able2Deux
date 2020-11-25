import React, { useCallback } from 'react'
import { func, number, oneOf, oneOfType, string } from 'prop-types'

import { keepInRange } from 'utilities'

const fineTuneOn = e => {
	if (e.shiftKey) e.target.step = 0.05
}

const fineTuneOff = e => {
	e.target.step = 1
}

const NumberInput = ({
	name,
	title,
	id,
	value = 0,
	defaultValue = 0,
	min = 0,
	max = 100,
	onChange
}) => {
	const onChangeParse = useCallback(e => {
		const { name, value } = e.target

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
			id={id}
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

NumberInput.propTypes = {
	name: string,
	title: string,
	id: string,
	value: oneOfType([oneOf(['']), number]).isRequired,
	defaultValue: number,
	min: number,
	max: number,
	onChange: func
}

export default NumberInput
