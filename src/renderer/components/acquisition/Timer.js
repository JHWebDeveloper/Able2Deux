import React, { useEffect, useRef } from 'react'
import { bool, number } from 'prop-types'

import { secondsToTC } from 'utilities'

import Checkbox from '../form_elements/Checkbox'

let seconds = 0
let interval = false

const Timer = ({ start, decrement }) => {
	const ref = useRef()

	useEffect(() => {
		let dir = 1

		if (decrement) {
			seconds = start
			dir = -1
		}

		interval = setInterval(() => {
			seconds += dir
			ref.current.value = secondsToTC(seconds)
		}, 1000)

		return () => {
			clearInterval(interval)
			seconds = 0
			interval = false
		}
	}, [])

	return (
		<div className="timecode">
			<Checkbox
				name="enabled"
				checked={true}
				disabled={true}
				switchIcon />
			<input
				type="text"
				className="monospace"
				ref={ref}
				value={secondsToTC(decrement ? start : 0)}
				title={`Time ${decrement ? 'remaining' : 'ellapsed'}`}
				style={{ cursor: 'default' }}
				readOnly/>
		</div>
	)
}

Timer.propTypes = {
	start: number.isRequired,
	decrement: bool.isRequired
}

export default Timer
