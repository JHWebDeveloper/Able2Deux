import React, { useCallback, useEffect, useState } from 'react'
import { bool, func, number, string } from 'prop-types'

import { clamp } from 'utilities'

const TimecodeInput = ({
	id,
	name,
	title,
	value,
	min = 0,
	max,
	fps,
	onChange,
	tcStringToNumber,
	numberToTCString,
	numberToAudibleTC,
	limitChars,
	disabled
}) => {
	const [ display, setDisplay ] = useState(numberToTCString(value, fps))

	const updateTimecode = useCallback(value => onChange({
		name,
		value: clamp(value, min, max)
	}), [min, max])

	const syncTimecode = useCallback(value => {
		value = tcStringToNumber(value, fps)
		value = clamp(value, min, max)

		setDisplay(numberToTCString(value, fps))
		updateTimecode(value)
	}, [min, max])

	const pasteTimecode = useCallback(async e => {
		e.preventDefault()
	
		let txt = await navigator.clipboard.readText()
		
		txt = txt.replace(/[^:;.0-9]/g, '')
		
		updateTimecode(tcStringToNumber(txt, fps))
	}, [min, max])

	const onKeyDown = useCallback(e => {
		limitChars(e)
		
		switch (e.key) {
			case 'Enter':
				e.preventDefault()
				syncTimecode(e.target.value)
				break
			case 'ArrowUp':
				e.preventDefault()
				updateTimecode(value + 1)
				break
			case 'ArrowDown':
				e.preventDefault()
				updateTimecode(value - 1)
				break
			default:
				return true
		}
	}, [value, min, max])

	useEffect(() => {
		setDisplay(numberToTCString(value, fps))
	}, [value])

	return (
		<input
			type="text"
			className="panel-input timecode monospace"
			id={id}
			name={name}
			title={title}
			value={display}
			onKeyDown={onKeyDown}
			onChange={e => setDisplay(e.target.value)}
			onBlur={e => syncTimecode(e.target.value)}
			onPaste={pasteTimecode}
			disabled={disabled}
			aria-label={title}
			aria-valuetext={numberToAudibleTC(value, fps)}
			aria-valuemin={numberToAudibleTC(min, fps)}
			aria-valuemax={numberToAudibleTC(max, fps)} />
	)
}

TimecodeInput.propTypes = {
	id: string,
	name: string,
	title: string,
	value: number,
	min: number,
	max: number.isRequired,
	fps: number,
	onChange: func.isRequired,
	tcStringToNumber: func.isRequired,
	numberToTCString: func.isRequired,
	numberToAudibleTC: func,
	limitChars: func.isRequired,
	disabled: bool
}

export default TimecodeInput
