import React, { useCallback } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { clamp } from 'utilities'

const onKeyDown = e => {
	if (e.shiftKey) e.target.step = 0.1
}

const onKeyUp = e => {
	e.target.step = 1
}

const keepInRange = (defaultValue, e) => {
	let { value, min, max } = e.target

	value = value === '' ? parseFloat(defaultValue) : parseFloat(value)
	min = parseFloat(min)
	max = parseFloat(max)

	return clamp(value, min, max)
}

const NumberInput = ({
	name,
	title,
	id,
	value = 0,
	defaultValue = 0,
	min = 0,
	max = 100,
	onChange,
	disableFineTuning = false
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
		value: keepInRange(defaultValue, e)
	}), [onChange])

	return (
		<input
			type="number"
			className="panel-input monospace"
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
			{...disableFineTuning ? {} : { onKeyDown, onKeyUp }} />
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
	onChange: func,
	disableFineTuning: bool
}

export default NumberInput
