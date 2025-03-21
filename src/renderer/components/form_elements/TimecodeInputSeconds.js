import React from 'react'
import { bool, func, number, string } from 'prop-types'

import {
	tcToSeconds,
	limitTCChars,
	secondsToAudibleTC,
	secondsToTC
} from 'utilities'

import TimecodeInput from './TimecodeInput'

const limitChars = limitTCChars(2)

const TimecodeInputSeconds = props => (
	<TimecodeInput
		tcStringToNumber={tcToSeconds}
		numberToTCString={secondsToTC}
		numberToAudibleTC={secondsToAudibleTC}
		limitChars={limitChars}
		{...props} />
)

TimecodeInputSeconds.propTypes = {
	name: string,
	title: string,
	timecode: string,
	value: number,
	min: number,
	max: number.isRequired,
	disabled: bool,
	onChange: func.isRequired
}

export default TimecodeInputSeconds
