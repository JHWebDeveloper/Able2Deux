import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import {
	toggleCheckbox,
	updateState,
	updateStateFromEvent
} from 'actions'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'
import NumberInput from '../form_elements/NumberInput'

const OPTIMIZE_BUTTONS = Object.freeze([
	{
		label: 'Optimize Video Quality',
		value: 'quality'
	},
	{
		label: 'Optimize Download Time',
		value: 'download'
	}
])

const SCREENSHOT_BUTTONS = Object.freeze([
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
			<fieldset className="radio-set">
				<legend>Default Download Mode:</legend>
				<RadioSet 
					name="optimize"
					state={preferences.optimize}
					onChange={e => dispatch(updateStateFromEvent(e))}
					buttons={OPTIMIZE_BUTTONS}/>
			</fieldset>
			<fieldset className="radio-set">
				<legend>Default Screen Capture Mode:</legend>
				<RadioSet 
					name="screenshot"
					state={preferences.screenshot ? 'screenshot' : 'screen_record'}
					onChange={screenshotToBoolean}
					buttons={SCREENSHOT_BUTTONS}/>
			</fieldset>
			<span className="input-option">
				<Checkbox
					label="Timer Enabled by Default"
					name="timerEnabled"
					checked={preferences.timerEnabled}
					onChange={e => dispatch(toggleCheckbox(e))}
					switchIcon />
			</span>
			<span className="input-option">
				<label htmlFor="screenRecorderFrameRate">Screen Recorder Frame Rate</label>
				<NumberInput
					name="screenRecorderFrameRate"
					id="screenRecorderFrameRate"
					value={preferences.screenRecorderFrameRate}
					min={1}
					max={120}
					microStep={1}
					onChange={updateStateDispatch} />
			</span>
			<span className="input-option">
				<label htmlFor="timer">Default Timer Duration</label>
				<TimecodeInputSeconds
					name="timer"
					id="timer"
					value={preferences.timer}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</span>
		</>
	)
}

export default AcquisitionSettings
