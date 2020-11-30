import React from 'react'
import { bool, func, number, string } from 'prop-types'

import { tcToSeconds, secondsToTC, limitTCChars } from 'utilities'

import TimecodeInputTemplate from './TimecodeInputTemplate'

const limitChars = limitTCChars(2)

const TimecodeInput = props => (
	<TimecodeInputTemplate
		tcStringToNumber={tcToSeconds}
		numberToTCString={secondsToTC}
		limitChars={limitChars}
		{...props} />
)

TimecodeInput.propTypes = {
	name: string,
	title: string,
	timecode: string,
	value: number,
	min: number,
	max: number.isRequired,
	disabled: bool,
	onChange: func.isRequired
}

export default TimecodeInput
