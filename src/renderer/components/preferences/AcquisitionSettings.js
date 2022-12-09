import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import { updateState, updateStateFromEvent, toggleCheckbox } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'
import NumberInput from '../form_elements/NumberInput'
import ScratchDisk from './ScratchDisk'

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
		<form>
			<ScratchDisk
				scratchDisk={preferences.scratchDisk}
				dispatch={dispatch} />
			<fieldset>
				<legend>Default Download Mode</legend>
				<div>
					<RadioSet 
						name="optimize"
						state={preferences.optimize}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={optimizeButtons}/>
				</div>
			</fieldset>
			<fieldset>
				<legend>Default Screen Capture Mode</legend>
				<div>
					<RadioSet 
						name="screenshot"
						state={preferences.screenshot ? 'screenshot' : 'screen_record'}
						onChange={screenshotToBoolean}
						buttons={screenshotButtons}/>
				</div>
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
					fineTuneStep={1}
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
		</form>
	)
}

export default AcquisitionSettings
