import React, { useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import {
	updateState,
	updateStateFromEvent,
	toggleCheckbox,
	toggleNestedCheckbox
} from 'actions'

import PrefsPanel from './PrefsPanel'
import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'

const FormattingSettings = props => {
	const { gridButtons, dispatch } = props

	const toggleCheckboxDispatch = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	const updateStateDispatch = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	const toggleGridButton = useCallback(e => {
		dispatch(toggleNestedCheckbox('gridButtons', e))
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
			<div className="grid-buttons-grid">
				<h2>Grid Buttons</h2>
				<Checkbox
					label="4:3"
					name="_43"
					checked={gridButtons._43}
					onChange={toggleGridButton} />
				<Checkbox
					label="1:1"
					name="_11"
					checked={gridButtons._11}
					onChange={toggleGridButton} />
				<Checkbox
					label="9:16"
					name="_916"
					checked={gridButtons._916}
					onChange={toggleGridButton} />
				<Checkbox
					label="2.39:1"
					name="_239"
					checked={gridButtons._239}
					onChange={toggleGridButton} />
				<Checkbox
					label="1.85:1"
					name="_185"
					checked={gridButtons._185}
					onChange={toggleGridButton} />
				<Checkbox
					label="1.66:1"
					name="_166"
					checked={gridButtons._166}
					onChange={toggleGridButton} />
			</div>
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
	gridButtons: exact({
		_239: bool,
		_185: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}),
	gridColor: string.isRequired,
	split: number.isRequired,
	scaleSliderMax: number.isRequired,
	dispatch: func.isRequired
}

export default FormattingSettings
