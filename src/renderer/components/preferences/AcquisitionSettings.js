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
			<RadioSet
				label="Default Download Mode"
				name="optimize"
				state={preferences.optimize}
				onChange={e => dispatch(updateStateFromEvent(e))}
				buttons={OPTIMIZE_BUTTONS} />
			<RadioSet
				label="Default Screen Capture Mode"
				name="screenshot"
				state={preferences.screenshot ? 'screenshot' : 'screen_record'}
				onChange={screenshotToBoolean}
				buttons={SCREENSHOT_BUTTONS} />
			<span className="input-option">
				<Checkbox
					label="Timer Enabled by Default"
					name="timerEnabled"
					checked={preferences.timerEnabled}
					onChange={e => dispatch(toggleCheckbox(e))}
					switchIcon />
			</span>
			<span className="input-option">
				<label>
					<span>Screen Recorder Frame Rate</span>
					<NumberInput
						name="screenRecorderFrameRate"
						value={preferences.screenRecorderFrameRate}
						min={1}
						max={120}
						microStep={1}
						onChange={updateStateDispatch} />
				</label>
			</span>
			<span className="input-option">
				<label>
					<span>Default Timer Duration</span>
					<TimecodeInputSeconds
						name="timer"
						value={preferences.timer}
						min={1}
						max={86399}
						onChange={updateStateDispatch} />
				</label>
			</span>
		</>
	)
}

export default AcquisitionSettings
