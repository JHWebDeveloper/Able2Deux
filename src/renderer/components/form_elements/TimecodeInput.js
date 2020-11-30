import React, { useCallback, useEffect, useState } from 'react'
import { bool, func, number, string } from 'prop-types'

import { clamp, secondsToTC, tcToSeconds, limitTCChars } from 'utilities'

const limitChars = limitTCChars(2)

const TimecodeInput = ({
	name,
	title,
	value = 0,
	min = 0,
	max = 86399, // 86399 == 23:59:59
	disabled = false,
	onChange
}) => {
	const [ display, updateDisplay ] = useState(secondsToTC(value))

	const updateTimecode = useCallback(value => onChange({
		name,
		value: clamp(value, min, max)
	}), [min, max])

	const syncTimecode = useCallback(value => {
		value = tcToSeconds(value)
		value = clamp(value, min, max)

		updateDisplay(secondsToTC(value))
		updateTimecode(value)
	}, [min, max])

	const pasteTimecode = useCallback(async e => {
		e.preventDefault()
	
		let txt = await navigator.clipboard.readText()
		
		txt = txt.replace(/[^:;0-9]/g, '')
		
		updateTimecode(tcToSeconds(txt))
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
		updateDisplay(secondsToTC(value))
	}, [value])

	return (
		<input
			type="text"
			className="monospace"
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
	name: string,
	title: string,
	timecode: string,
	value: number,
	min: number,
	max: number,
	disabled: bool,
	onChange: func.isRequired
}

export default TimecodeInput
