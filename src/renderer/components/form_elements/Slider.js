import React, { useMemo } from 'react'
import { v1 as uuid } from 'uuid'
import { arrayOf, bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { keepInRange } from '../../utilities'

const fineTuneOn = e => {
	if (e.shiftKey) e.target.step = 0.1
}

const fineTuneOff = e => {
	e.target.step = 1
}

const Slider = ({
	label,
	hideLabel,
	name,
	value = 0,
	min = -100,
	max = 100,
	defaultValue = 0,
	inputMax,
	points,
	disabled,
	onChange,
	inverted,
	Button
}) => {
	const listID = useMemo(uuid, [])

	return (
		<div className="slider">
			{!hideLabel && <span>{label}</span>}
			<input
				type="range"
				name={name}
				className={inverted ? 'inverted' : ''}
				title={label}
				list={listID}
				value={value}
				min={min}
				max={max}
				onChange={onChange}
				step={1}
				onKeyDown={fineTuneOn}
				onKeyUp={fineTuneOff}
				disabled={disabled}
				data-default-value={defaultValue}
				data-number />
			{points && (
				<datalist id={listID}>
					{points.map(point => <option key={uuid()}>{point}</option>)}
				</datalist>
			)}
			{Button && <Button />}
			<input
				type="number"
				name={name}
				title={label}
				value={value}
				min={min}
				max={inputMax ?? max}
				onChange={onChange}
				onClick={e => e.currentTarget.select()}
				onBlur={e => onChange(keepInRange(e))}
				step={1}
				onKeyDown={fineTuneOn}
				onKeyUp={fineTuneOff}
				disabled={disabled}
				data-default-value={defaultValue}
				data-number />
			<span>%</span>
		</div>
	)
}

Slider.propTypes = {
	label: string.isRequired,
	hideLabel: bool,
	name: string.isRequired,
	value: oneOfType([oneOf(['']), number]),
	min: number,
	max: number,
	defaultValue: number,
	inputMax: number,
	points: arrayOf(number),
	unit: string,
	disabled: bool,
	inverted: bool,
	Button: func,
	onChange: func.isRequired
}

export default Slider
