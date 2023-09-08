import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import {
	toggleCheckbox,
	updateState,
	updateStateFromEvent
} from 'actions'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'

const OUTPUT_BUTTONS = Object.freeze([
	{
		label: '1280x720',
		value: '1280x720'
	},
	{
		label: '1920x1080',
		value: '1920x1080'
	}
])

const FRAME_RATE_BUTTONS = Object.freeze([
	{
		label: 'Auto',
		value: 'auto'
	},
	{
		label: '29.97',
		value: '29.97'
	},
	{
		label: '59.94',
		value: '59.94'
	}
])

const RenderOutput = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	const updateCustomFrameRate = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	const updateConcurrent = useCallback(({ name, value }) => {
		dispatch(updateState({
			[name]: value === '' ? value : Math.trunc(value)
		}))
	}, [])

	return (
		<form>
			<fieldset className="radio-set">
				<legend>Output Resolution:</legend>
				<RadioSet 
					name="renderOutput"
					state={preferences.renderOutput}
					onChange={e => dispatch(updateStateFromEvent(e))}
					buttons={OUTPUT_BUTTONS} />
			</fieldset>
			<fieldset className="radio-set">
				<legend>Output Frame Rate:</legend>
				<RadioSet 
					name="renderFrameRate"
					state={preferences.renderFrameRate}
					onChange={e => dispatch(updateStateFromEvent(e))}
					buttons={[
						...FRAME_RATE_BUTTONS,
						{
							label: 'custom',
							value: 'custom',
							component: <NumberInput
								name="customFrameRate"
								value={preferences.customFrameRate}
								min={1}
								max={240}
								onChange={updateCustomFrameRate} />
						}
					]} />
			</fieldset>
			<span className="input-option">
				<Checkbox
					label="Auto Export Still Video as .png"
					name="autoPNG"
					checked={preferences.autoPNG}
					onChange={e => dispatch(toggleCheckbox(e))}
					switchIcon/>
			</span>
			<span className="input-option">
				<Checkbox
					label="Filter Unsafe Characters for Aspera"
					name="asperaSafe"
					checked={preferences.asperaSafe}
					onChange={e => dispatch(toggleCheckbox(e))}
					switchIcon />
			</span>
			<span className="input-option">
				<label htmlFor="concurrent">Concurrent Renders</label>
				<NumberInput
					name="concurrent"
					id="concurrent"
					value={preferences.concurrent}
					min={1}
					max={10}
					defaultValue={2}
					microStep={1}
					onChange={updateConcurrent} />
			</span>
		</form>
	)
}

export default RenderOutput
