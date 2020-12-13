import React, { useCallback } from 'react'
import { func, number, oneOf, bool } from 'prop-types'

import { updateState, updateStateFromEvent, toggleCheckbox } from 'actions'

import PrefsPanel from './PrefsPanel'
import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'

const outputButtons = [
	{
		label: '1280x720',
		value: '1280x720'
	},
	{
		label: '1920x1080',
		value: '1920x1080'
	}
]

const frameRateButtons = [
	{
		label: 'Auto',
		value: 'auto'
	},
	{
		label: '59.94fps',
		value: '59.94fps'
	}
]

const RenderOutput = ({ renderOutput, renderFrameRate, autoPNG, asperaSafe, concurrent, dispatch }) => {
	const updateConcurrent = useCallback(({ name, value }) => {
		dispatch(updateState({
			[name]: value === '' ? value : Math.floor(value)
		}))
	}, [])

	return (
		<PrefsPanel title="Output" className="output-grid span-1_3">
			<fieldset>
				<legend>Resolution</legend>
				<div>
					<RadioSet 
						name="renderOutput"
						state={renderOutput}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={outputButtons}/>
				</div>
			</fieldset>
			<fieldset>
				<legend>Frame Rate</legend>
				<div>
					<RadioSet 
						name="renderFrameRate"
						state={renderFrameRate}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={frameRateButtons}/>
				</div>
			</fieldset>
			<Checkbox
				label="Auto Export as .png"
				name="autoPNG"
				checked={autoPNG}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon/>
			<Checkbox
				label="Aspera Safe Characters"
				name="asperaSafe"
				checked={asperaSafe}
				onChange={e => dispatch(toggleCheckbox(e))}
				switchIcon/>
			<span className="input-option">
				<label htmlFor="concurrent">Concurrent Renders</label>
				<NumberInput
					name="concurrent"
					id="concurrent"
					value={concurrent}
					min={1}
					max={10}
					defaultValue={2}
					fineTuneStep={1}
					onChange={updateConcurrent} />
			</span>
		</PrefsPanel>
	)
}

RenderOutput.propTypes = {
	renderOutput: oneOf([
		'1280x720',
		'1920x1080'
	]).isRequired,
	renderFrameRate: oneOf([
		'auto',
		'59.94fps'
	]).isRequired,
	autoPNG: bool.isRequired,
	asperaSafe: bool.isRequired,
	concurrent: number.isRequired,
	dispatch: func.isRequired
}

export default RenderOutput
