import React, { useCallback } from 'react'
import { bool, func, number } from 'prop-types'

import { updateState, toggleCheckbox } from 'actions'

import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'
import Clock from '../form_elements/Clock'

const ScreenRecorderTimer = ({ timer, timerEnabled, screenshot, recording, recordButton, dispatch }) => {
	const updateTimecode = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	const toggleTimer = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	return (
		<div className="screen-recorder-timer">
			<Checkbox
				name="timerEnabled"
				checked={timerEnabled}
				onChange={toggleTimer}
				disabled={screenshot || recording}
				switchIcon />
			{recording ? ( // eslint-disable-line no-extra-parens
				<Clock
					start={timer}
					decrement={timerEnabled}
					recordIndicator={recordButton} />
			) : (
				<TimecodeInputSeconds
					name="timer"
					title="Record Timer"
					value={timer}
					min={1}
					max={86399}
					onChange={updateTimecode}
					disabled={!timerEnabled || screenshot || recording} />
			)}
		</div>
	)
}

ScreenRecorderTimer.propTypes = {
	timer: number.isRequired,
	timerEnabled: bool.isRequired,
	screenshot: bool.isRequired,
	recording: bool.isRequired,
	dispatch: func.isRequired
}

export default ScreenRecorderTimer
