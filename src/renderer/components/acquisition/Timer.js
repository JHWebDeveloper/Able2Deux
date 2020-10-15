import React, { useEffect, useRef } from 'react'

import { secondsToTC } from '../../utilities'

import Checkbox from '../form_elements/Checkbox'

let seconds = 0
let interval = false

const Timer = ({ start }) => {
	const ref = useRef()

	useEffect(() => {
		let dir = 1

		if (start) {
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
				value={secondsToTC(start || 0)}
				title={`Time ${start ? 'remaining' : 'ellapsed'}`}
				style={{ cursor: 'default' }}
				readOnly/>
		</div>
	)
}

export default Timer
