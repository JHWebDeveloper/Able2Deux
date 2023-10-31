import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import {
	toggleCheckbox,
	updateState,
	updateStateFromEvent
} from 'actions'

import { OPTION_SET } from 'constants'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'
import NumberInput from '../form_elements/NumberInput'

const SCREENSHOT_OPTIONS = Object.freeze([
	{
		label: 'Screen Record',
		value: 'screen_record'
	},
	{
		label: 'Screenshot',
		value: 'screenshot'
	}
])

const AcquisitionSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	const screenshotToBoolean = useCallback(e => {
		dispatch(updateState({
			screenshot: e.target.value === 'screenshot'
		}))
	}, [])

	const updateStateDispatch = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	return (
		<>
			<RadioSet
				label="Default Download Optimization"
				name="optimize"
				state={preferences.optimize}
				onChange={e => dispatch(updateStateFromEvent(e))}
				options={OPTION_SET.optimize} />
			<RadioSet
				label="Default Screen Capture Mode"
				name="screenshot"
				state={preferences.screenshot ? 'screenshot' : 'screen_record'}
				onChange={screenshotToBoolean}
				options={SCREENSHOT_OPTIONS} />
			<Checkbox
				label="Timer Enabled by Default"
				name="timerEnabled"
				checked={preferences.timerEnabled}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon />
			<label className="label-with-input">
				<span>Screen Recorder Frame Rate</span>
				<NumberInput
					name="screenRecorderFrameRate"
					value={preferences.screenRecorderFrameRate}
					min={1}
					max={120}
					microStep={1}
					onChange={updateStateDispatch} />
			</label>
			<label className="label-with-input">
				<span>Default Timer Duration</span>
				<TimecodeInputSeconds
					name="timer"
					value={preferences.timer}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</label>
		</>
	)
}

export default AcquisitionSettings
