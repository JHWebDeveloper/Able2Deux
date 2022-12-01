import React, { useEffect, useRef } from 'react'
import { bool, number, object } from 'prop-types'

import { secondsToTC } from 'utilities'

const blink = 'blink'

const Clock = ({ start, decrement, recordIndicator }) => {
	const ref = useRef()
	let seconds = 0
	let tick = 0
	let interval = false

	useEffect(() => {
		const dir = decrement ? -1 : 1

		seconds = decrement ? start : 0
		
		interval = setInterval(() => {
			if (tick++) {
				recordIndicator.className = ''
			} else {
				ref.current.value = secondsToTC(seconds += dir)
				recordIndicator.className = blink
			}

			tick &= 1

			if (decrement && seconds < 1) clearInterval(interval)
		}, 500)

		return () => {
			clearInterval(interval)
			recordIndicator.className = ''
		}
	}, [])

	return (
		<input
			type="text"
			className="timecode monospace"
			ref={ref}
			value={secondsToTC(decrement ? start : 0)}
			title={`Time ${decrement ? 'remaining' : 'ellapsed'}`}
			style={{ cursor: 'default' }}
			readOnly />
	)
}

Clock.propTypes = {
	start: number.isRequired,
	decrement: bool.isRequired,
	recordIndicator: object.isRequired
}

export default Clock
