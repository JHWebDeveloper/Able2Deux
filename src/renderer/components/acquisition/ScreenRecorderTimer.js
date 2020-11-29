import React, { useCallback, useState } from 'react'
import { bool, func, number } from 'prop-types'

import Checkbox from '../form_elements/Checkbox'
import TimecodeInput from '../form_elements/TimecodeInput'
import Clock from '../form_elements/Clock'

const ScreenRecorderTimer = ({ timer, setTimer, screenshot, recording }) => {
	const [ enabled, toggleTimer ] = useState(false)

	const updateTimecode = useCallback(({ value }) => setTimer(value), [])

	return (
		<div className="timecode">
			<Checkbox
				name="enabled"
				checked={enabled}
				onChange={() => toggleTimer(!enabled)}
				disabled={screenshot || recording}
				switchIcon />
			{recording ? ( // eslint-disable-line no-extra-parens
				<Clock
					start={timer}
					decrement={enabled} />
			) : (
				<TimecodeInput
					title="Record Timer"
					value={timer}
					min={1}
					onChange={updateTimecode}
					disabled={!enabled || screenshot || recording} />
			)}
		</div>
	)
}

ScreenRecorderTimer.propTypes = {
	timer: number.isRequired,
	setTimer: func.isRequired,
	screenshot: bool.isRequired,
	recording: bool.isRequired
}

export default ScreenRecorderTimer
