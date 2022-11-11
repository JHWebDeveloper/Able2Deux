import React, { useEffect, useRef } from 'react'
import { bool, number } from 'prop-types'

import { secondsToTC } from 'utilities'

const blink = 'blink'
let seconds = 0
let ticks = 0
let interval = false

const Clock = ({ start, decrement, recordIndicator }) => {
	const ref = useRef()

	useEffect(() => {
		const dir = decrement ? -1 : 1
		seconds = decrement ? start : 0

		interval = setInterval(() => {
			if (ticks++ % 2 === 0) {
				ref.current.value = secondsToTC(seconds)
				recordIndicator.className = blink
				seconds += dir
			} else {
				recordIndicator.className = ''
			}

			if (decrement && seconds < 1) clearInterval(interval)
		}, 500)

		return () => {
			clearInterval(interval)
			seconds = 0
			ticks = 0
			interval = false
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
	decrement: bool.isRequired
}

export default Clock
