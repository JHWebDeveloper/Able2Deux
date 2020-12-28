import React, { useCallback } from 'react'
import { bool, func, number, string } from 'prop-types'

import { updateState, updateStateFromEvent, toggleCheckbox } from 'actions'

import PrefsPanel from './PrefsPanel'
import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'

const FormattingSettings = props => {
	const { dispatch } = props

	const toggleCheckboxDispatch = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	const updateStateDispatch = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	return (
		<PrefsPanel title="Formatting Settings" className="span-1_3">
			<Checkbox
				label="Edit All by Default"
				name="editAll"
				checked={props.editAll}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<Checkbox
				label="Slider Snap Points"
				name="sliderSnapPoints"
				checked={props.sliderSnapPoints}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<Checkbox
				label="Widescreen Grids"
				name="enableWidescreenGrids"
				checked={props.enableWidescreenGrids}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<span className="input-option">
				<label htmlFor="grid-color">Grid Color</label>
				<input
					type="color"
					name="gridColor"
					id="grid-color"
					value={props.gridColor}
					onChange={e => dispatch(updateStateFromEvent(e))} />
			</span>
			<span>
				<label htmlFor="split">Split Duration</label>
				<TimecodeInputSeconds
					name="split"
					id="split"
					value={props.split}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</span>
			<span>
				<label htmlFor="scaleSliderMax">Scale Slider Max</label>
				<NumberInput
					name="scaleSliderMax"
					id="scaleSliderMax"
					value={props.scaleSliderMax}
					min={100}
					max={4500}
					fineTuneStep={1}
					defaultValue={400}
					onChange={updateStateDispatch} />
			</span>
		</PrefsPanel>
	)
}

FormattingSettings.propTypes = {
	editAll: bool.isRequired,
	sliderSnapPoints: bool.isRequired,
	enableWidescreenGrids: bool.isRequired,
	gridColor: string.isRequired,
	split: number.isRequired,
	scaleSliderMax: number.isRequired,
	dispatch: func.isRequired
}

export default FormattingSettings
