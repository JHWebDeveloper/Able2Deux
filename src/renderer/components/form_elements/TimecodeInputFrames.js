import React from 'react'
import { func, number, string } from 'prop-types'

import { framesToTC, tcToFrames, limitTCChars } from 'utilities'

import TimecodeInputTemplate from './TimecodeInputTemplate'

const limitChars = limitTCChars(3)

const TimecodeInputFrames = props => (
	<TimecodeInputTemplate
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
