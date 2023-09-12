import React, { useEffect, useRef, useState } from 'react'
import { bool, number, object } from 'prop-types'

import { secondsToTC } from 'utilities'

const Clock = ({ start, decrement, recordIndicator }) => {
	const [ halfSeconds, setHalfSeconds ] = useState(decrement ? start : 0)
	const clock = useRef(null)
	const interval = useRef(null)
	const tick = useRef(0)
	const title = useRef(`Time ${decrement ? 'remaining' : 'ellapsed'}`)

	useEffect(() => {
		const dir = decrement ? -1 : 1
		
		interval.current = setInterval(() => {
			recordIndicator.current.classList.toggle('blink')

			if (!tick.current++) setHalfSeconds(s => {
				const nextHalfSecond = s + dir

				if (decrement && nextHalfSecond < 1) clearInterval(interval.current)

				return nextHalfSecond
			})

			tick.current &= 1 // tracks whether tick is even (at the half-second) or odd (at the second)
		}, 500)

		return () => {
			clearInterval(interval.current)
			recordIndicator.current.classList.remove('blink')
		}
	}, [])

	return (
		<input
			type="text"
			className="timecode monospace"
			ref={clock}
			value={secondsToTC(halfSeconds)}
			title={title.current}
			aria-label={title.current}
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
