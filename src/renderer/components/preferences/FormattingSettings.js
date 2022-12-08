import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import {
	updateState,
	updateStateFromEvent,
	toggleCheckbox,
	enableAspectRatioMarker
} from 'actions'

import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'

const FormattingSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	const toggleCheckboxDispatch = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	const updateStateDispatch = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	return (
		<form>
			<Checkbox
				label="Edit All by Default"
				name="editAll"
				checked={preferences.editAll}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<Checkbox
				label="Slider Snap Points"
				name="sliderSnapPoints"
				checked={preferences.sliderSnapPoints}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<div className="grid-buttons-grid">
				<h2>Grid Buttons</h2>
				{preferences.aspectRatioMarkers.map(({ label, disabled, id }) => (
					<Checkbox
						key={id}
						label={label}
						checked={!disabled}
						onChange={() => dispatch(enableAspectRatioMarker(id))} />
				))}
			</div>
			<span className="input-option">
				<label htmlFor="grid-color">Grid Color</label>
				<input
					type="color"
					name="gridColor"
					id="grid-color"
					value={preferences.gridColor}
					onChange={e => dispatch(updateStateFromEvent(e))} />
			</span>
			<span>
				<label htmlFor="split">Split Duration</label>
				<TimecodeInputSeconds
					name="split"
					id="split"
					value={preferences.split}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</span>
			<Checkbox
				label="Animated by Default"
				name="animateBackground"
				checked={preferences.animateBackground}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<Checkbox
				label="Enable 11pm Backgrounds"
				name="enable11pmBackgrounds"
				checked={preferences.enable11pmBackgrounds}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<span>
				<label htmlFor="scaleSliderMax">Scale Slider Max</label>
				<NumberInput
					name="scaleSliderMax"
					id="scaleSliderMax"
					value={preferences.scaleSliderMax}
					min={100}
					max={4500}
					fineTuneStep={1}
					defaultValue={400}
					onChange={updateStateDispatch} />
			</span>
		</form>
	)
}

export default FormattingSettings
