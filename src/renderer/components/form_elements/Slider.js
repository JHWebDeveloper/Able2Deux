import React, { useMemo } from 'react'
import { v1 as uuid } from 'uuid'
import { arrayOf, bool, element, func, number, string } from 'prop-types'

import { keepInRange } from '../../utilities'

const Slider = ({
	label,
	hideLabel,
	name,
	value = 0,
	min = -100,
	max = 100,
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
				disabled={disabled}
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
				max={inputMax || max}
				onChange={onChange}
				onBlur={e => onChange(keepInRange(e))}
				disabled={disabled}
				data-number />
			<span>%</span>
		</div>
	)
}

Slider.propTypes = {
	label: string.isRequired,
	hideLabel: bool,
	name: string.isRequired,
	value: number,
	min: number,
	max: number,
	inputMax: number,
	points: arrayOf(number),
	unit: string,
	disabled: bool,
	inverted: bool,
	Button: element,
	onChange: func.isRequired
}

export default Slider
