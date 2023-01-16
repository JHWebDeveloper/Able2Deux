import React from 'react'
import { func, number, string } from 'prop-types'

import { framesToTC, tcToFrames, framesToAudibleTC, limitTCChars } from 'utilities'

import TimecodeInput from './TimecodeInput'

const limitChars = limitTCChars(3)

const TimecodeInputFrames = props => (
	<TimecodeInput
		tcStringToNumber={tcToFrames}
		numberToTCString={framesToTC}
		numberToAudibleTC={framesToAudibleTC}
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
