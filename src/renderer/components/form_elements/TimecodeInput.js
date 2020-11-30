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
	limitChars,
	disabled
}) => {
	const [ display, updateDisplay ] = useState(numberToTCString(value, fps))

	const updateTimecode = useCallback(value => onChange({
		name,
		value: clamp(value, min, max)
	}), [min, max])

	const syncTimecode = useCallback(value => {
		value = tcStringToNumber(value, fps)
		value = clamp(value, min, max)

		updateDisplay(numberToTCString(value, fps))
		updateTimecode(value)
	}, [min, max])

	const pasteTimecode = useCallback(async e => {
		e.preventDefault()
	
		let txt = await navigator.clipboard.readText()
		
		txt = txt.replace(/[^:;.0-9]/g, '')
		
		updateTimecode(tcStringToNumber(txt, fps))
	}, [min, max])

	const onKeyDown = useCallback(e => {
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
		updateDisplay(numberToTCString(value, fps))
	}, [value])

	return (
		<input
			type="text"
			className="monospace"
			id={id}
			name={name}
			title={title}
			value={display}
			onKeyPress={limitChars}
			onKeyDown={onKeyDown}
			onChange={e => updateDisplay(e.target.value)}
			onBlur={e => syncTimecode(e.target.value)}
			onPaste={pasteTimecode}
			disabled={disabled} />
	)
}

TimecodeInput.propTypes = {
	id: string,
	name: string,
	value: number,
	min: number,
	max: number.isRequired,
	fps: number,
	onChange: func.isRequired,
	tcStringToNumber: func.isRequired,
	numberToTCString: func.isRequired,
	limitChars: func.isRequired,
	disabled: bool
}

export default TimecodeInput
