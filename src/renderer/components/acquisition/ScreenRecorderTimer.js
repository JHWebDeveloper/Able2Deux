import React, { useCallback } from 'react'
import { bool, func, number, object } from 'prop-types'

import { updateState, toggleCheckbox } from 'actions'

import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'
import Clock from './Clock'

const ScreenRecorderTimer = ({ timer, timerEnabled, screenshot, recording, recordButton, dispatch }) => {
	const updateTimecode = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	const toggleTimer = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	const title = `${timerEnabled ? 'Dis' : 'En'}able screen record timer`

	return (
		<div className="screen-recorder-timer">
			<Checkbox
				name="timerEnabled"
				title={title}
				aria-label={title}
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
	recordButton: object,
	dispatch: func.isRequired
}

export default ScreenRecorderTimer
