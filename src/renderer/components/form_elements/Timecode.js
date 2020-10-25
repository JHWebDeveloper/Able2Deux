import React, { useCallback, useEffect } from 'react'
import { bool, func, string } from 'prop-types'

import { tcToSeconds, simplifyTimecode } from 'utilities'

import Checkbox from './Checkbox'

const limitChars = e => {
	const colons = e.target.value.match(/:/g) || []
	const regex = colons.length === 2 ? /[0-9]/ : /[:0-9]/

	if (!regex.test(e.key)) e.preventDefault()
}

const Timecode = props => {
	const { enabled, initDisplay, onChange, disabled } = props

	const onTimecodeChange = useCallback(display => {
		onChange({
			display,
			tc: tcToSeconds(display)
		})
	}, [onChange])

	const pasteTimecode = useCallback(async e => {
		e.preventDefault()
	
		const txt = await navigator.clipboard.readText()
		
		onTimecodeChange(txt.replace(/[^:;0-9]/g, ''))
	}, [onChange])

	useEffect(() => {
		if (initDisplay) onTimecodeChange(initDisplay)
	}, [])

	return (
		<div className="timecode">
			<Checkbox
				name="enabled"
				label={props.label}
				checked={enabled}
				onChange={props.toggleTimecode}
				disabled={disabled}
				switchIcon />
			<input
				type="text"
				name={props.name}
				value={props.display}
				onKeyPress={limitChars}
				onPaste={pasteTimecode}
				onChange={e => onTimecodeChange(e.target.value)}
				onBlur={e => onTimecodeChange(simplifyTimecode(e.target.value))}
				disabled={disabled || !enabled}
				className={`monospace ${props.invalid ? 'invalid' : ''}`}
				title={props.title} />
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
	invalid: bool,
	title: string,
	toggleTimecode: func.isRequired,
	onChange: func.isRequired
}

export default Timecode
