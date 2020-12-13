import React, { useCallback } from 'react'
import { bool, func, number, oneOf } from 'prop-types'

import { updateState, updateStateFromEvent, toggleCheckbox } from 'actions'

import PrefsPanel from './PrefsPanel'
import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'
import NumberInput from '../form_elements/NumberInput'

const optimizeButtons = [
	{
		label: 'Optimize Video Quality',
		value: 'quality'
	},
	{
		label: 'Optimize Download Time',
		value: 'download'
	}
]

const screenshotButtons = [
	{
		label: 'Screen Record',
		value: 'screen_record'
	},
	{
		label: 'Screenshot',
		value: 'screenshot'
	}
]

const AcquisitionSettings = ({ optimize, screenRecorderFrameRate, screenshot, timerEnabled, timer, dispatch }) => {
	const screenshotToBoolean = useCallback(e => {
		dispatch(updateState({
			screenshot: e.target.value === 'screenshot'
		}))
	}, [])

	const updateStateDispatch = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	return (
		<PrefsPanel title="Acquisition Settings" className="span-third">
			<fieldset>
				<legend>Download Mode</legend>
				<div>
					<RadioSet 
						name="optimize"
						state={optimize}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={optimizeButtons}/>
				</div>
			</fieldset>
			<fieldset>
				<legend>Screen Capture Mode</legend>
				<div>
					<RadioSet 
						name="screenshot"
						state={screenshot ? 'screenshot' : 'screen_record'}
						onChange={screenshotToBoolean}
						buttons={screenshotButtons}/>
				</div>
			</fieldset>
			<span>
				<label htmlFor="screenRecorderFrameRate">Recorder Frame Rate</label>
				<NumberInput
					name="screenRecorderFrameRate"
					id="screenRecorderFrameRate"
					value={screenRecorderFrameRate}
					min={1}
					max={120}
					fineTuneStep={1}
					onChange={updateStateDispatch} />
			</span>
			<span>
				<label htmlFor="timer">Timer Duration</label>
				<TimecodeInputSeconds
					name="timer"
					id="timer"
					value={timer}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</span>
			<Checkbox
				label="Timer Enabled"
				name="timerEnabled"
				checked={timerEnabled}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon />
		</PrefsPanel>
	)
}

AcquisitionSettings.propTypes = {
	optimize: oneOf(['quality', 'download']),
	screenRecorderFrameRate: number.isRequired,
	screenshot: bool.isRequired,
	timerEnabled: bool.isRequired,
	timer: number.isRequired,
	dispatch: func.isRequired
}

export default AcquisitionSettings
