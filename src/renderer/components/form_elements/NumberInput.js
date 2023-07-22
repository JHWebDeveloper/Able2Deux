import React, { useCallback } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { clamp } from 'utilities'

const keepInRange = (defaultValue, e) => {
	let { value, min, max } = e.target

	value = value === '' ? parseFloat(defaultValue) : parseFloat(value)
	min = parseFloat(min)
	max = parseFloat(max)

	return clamp(value, min, max)
}

const onKeyUp = e => {
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
	step = 1,
	microStep = 0.1,
	macroStep = 10,
	decimalPlaces = 3,
	disabled = false,
	onChange,
	ariaLabelledby
}) => {
	const onChangeParse = useCallback(e => {
		const { name, value } = e.target

		onChange({
			name,
			value: value === '' ? value : Number(parseFloat(value).toFixed(decimalPlaces))
		})
	}, [onChange, decimalPlaces])

	const onBlurParse = useCallback(e => onChange({
		name: e.target.name,
		value: keepInRange(defaultValue, e)
	}), [onChange])

	const onKeyDown = useCallback(e => {
		if (e.altKey && e.shiftKey) {
			e.target.step = macroStep
		} else if (e.shiftKey) {
			e.target.step = microStep
		}
	}, [])

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
			step={step}
			onChange={onChangeParse}
			onClick={e => e.currentTarget.select()}
			onBlur={onBlurParse}
			onKeyUp={onKeyUp} 
			onKeyDown={onKeyDown}
			disabled={disabled}
			{...ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : { 'aria-label': title }} />
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
	step: number,
	microStep: number,
	macroStep: number,
	decimalPlaces: number,
	disabled: bool,
	onChange: func,
	ariaLabelledby: string 
}

export default NumberInput
