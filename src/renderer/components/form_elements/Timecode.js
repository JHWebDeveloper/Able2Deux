import React, { useCallback, useEffect } from 'react'
import { bool, func, string } from 'prop-types'

import { tcToSeconds, simplifyTimecode } from '../../utilities'

import Checkbox from './Checkbox'

const Timecode = ({ label, name, enabled, display, initDisplay, disabled, toggleTimecode, onChange }) => {
	const limitChars = useCallback(e => {
		const colons = e.target.value.match(/:/g) || []
		const regex = colons.length === 2 ? /[0-9]/ : /[:0-9]/

		if (!regex.test(e.key)) e.preventDefault()
	}, [])

	const onTimecodeChange = useCallback(display => {
		onChange({
			display,
			tc: tcToSeconds(display)
		})
	}, [])

	const pasteTimecode = useCallback(async e => {
		e.preventDefault()
	
		const txt = await navigator.clipboard.readText()
		
		onTimecodeChange(txt.replace(/[^:;0-9]/g, ''))
	}, [])

	useEffect(() => {
		if (initDisplay) onTimecodeChange(initDisplay)
	}, [])

	return (
		<div className="timecode">
			<Checkbox
				name="enabled"
				label={label}
				checked={enabled}
				onChange={e => toggleTimecode(e)}
				disabled={disabled}
				switchIcon />
			<input
				type="text"
				name={name}
				value={display}
				onKeyPress={limitChars}
				onPaste={e => pasteTimecode(e)}
				onChange={e => onTimecodeChange(e.target.value)}
				onBlur={e => onTimecodeChange(simplifyTimecode(e.target.value))}
				disabled={disabled || !enabled}
				className="monospace" />
		</div>
	)
}

Timecode.propTypes = {
	label: string,
	name: string.isRequired,
	enabled: bool.isRequired,
	display: string.isRequired,
	initDisplay: string,
	disabled: bool,
	toggleTimecode: func.isRequired,
	onChange: func.isRequired
}

export default Timecode
