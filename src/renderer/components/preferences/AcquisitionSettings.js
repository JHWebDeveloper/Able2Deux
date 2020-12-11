import React, { useCallback } from 'react'
import { bool, func, number, oneOf } from 'prop-types'

import { updateState, updateStateFromEvent, toggleCheckbox } from 'actions'

import PrefsPanel from './PrefsPanel'
import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'

const AcquisitionSettings = ({ optimize, screenshot, timerEnabled, timer, dispatch }) => {
	const screenshotToBoolean = useCallback(e => {
		dispatch(updateState({
			screenshot: e.target.value === 'screenshot'
		}))
	}, [])

	const updateRecordTimer = useCallback(({ name, value }) => {
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
						buttons={[
							{
								label: 'Optimize Video Quality',
								value: 'quality'
							},
							{
								label: 'Optimize Download Time',
								value: 'download'
							}
						]}/>
				</div>
			</fieldset>
			<fieldset>
				<legend>Screen Capture Mode</legend>
				<div>
					<RadioSet 
						name="screenshot"
						state={screenshot ? 'screenshot' : 'screen_record'}
						onChange={screenshotToBoolean}
						buttons={[
							{
								label: 'Screen Record',
								value: 'screen_record'
							},
							{
								label: 'Screenshot',
								value: 'screenshot'
							}
						]}/>
				</div>
			</fieldset>
			<Checkbox
				label="Timer Enabled"
				name="timerEnabled"
				checked={timerEnabled}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon />
			<span>
				<label>Timer Duration</label>
				<TimecodeInputSeconds
					name="timer"
					value={timer}
					min={1}
					max={86399}
					onChange={updateRecordTimer} />
			</span>
		</PrefsPanel>
	)
}

AcquisitionSettings.propTypes = {
	optimize: oneOf(['quality', 'download']),
	screenshot: bool.isRequired,
	timerEnabled: bool.isRequired,
	timer: number.isRequired,
	dispatch: func.isRequired
}

export default AcquisitionSettings
