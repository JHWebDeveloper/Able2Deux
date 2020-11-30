import React from 'react'
import { func, number, string } from 'prop-types'

import { framesToTC, tcToFrames, limitTCChars } from 'utilities'

import TimecodeInput from './TimecodeInput'

const limitChars = limitTCChars(3)

const TimecodeInputFrames = props => (
	<TimecodeInput
		tcStringToNumber={tcToFrames}
		numberToTCString={framesToTC}
		limitChars={limitChars}
		{...props} />
)

TimecodeInputFrames.propTypes = {
	id: string,
	name: string,
	value: number,
	fps: number,
	min: number,
	max: number.isRequired,
	onChange: func.isRequired
}

export default TimecodeInputFrames
