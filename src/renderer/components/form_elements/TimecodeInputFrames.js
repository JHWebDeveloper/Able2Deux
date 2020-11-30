import React, { useCallback, useEffect, useState } from 'react'
import { func, number, string } from 'prop-types'

import { clamp, framesToTC, tcToFrames, limitTCChars } from 'utilities'

const limitChars = limitTCChars(3)

const TimecodeInputFrames = ({
	id,
	name,
	value = 0,
	fps = 59.94,
	min = 0,
	max,
	onChange
}) => {
	const [ display, updateDisplay ] = useState(framesToTC(value, fps))

	const updateTimecode = useCallback(value => onChange({
		name,
		value: clamp(value, min, max)
	}), [min, max])

	const syncTimecode = useCallback(value => {
		value = tcToFrames(value, fps)
		value = clamp(value, min, max)

		updateDisplay(framesToTC(value, fps))
		updateTimecode(value)
	}, [min, max])

	const pasteTimecode = useCallback(async e => {
		e.preventDefault()
	
		let txt = await navigator.clipboard.readText()
		
		txt = txt.replace(/[^:;0-9]/g, '')
		
		updateTimecode(tcToFrames(txt, fps))
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
		updateDisplay(framesToTC(value, fps))
	}, [value])

	return (
		<input
			type="text"
			className="monospace"
			title="HH:MM:SS:FF"
			id={id}
			name={name}
			value={display}
			onKeyPress={limitChars}
			onKeyDown={onKeyDown}
			onChange={e => updateDisplay(e.target.value)}
			onBlur={e => syncTimecode(e.target.value)}
			onPaste={pasteTimecode} />
	)
}

TimecodeInputFrames.propTypes = {
	id: string,
	name: string,
	timecode: string,
	value: number,
	fps: number,
	min: number,
	max: number.isRequired,
	onChange: func.isRequired
}

export default TimecodeInputFrames
