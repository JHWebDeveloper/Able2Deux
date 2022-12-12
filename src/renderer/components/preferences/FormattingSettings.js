import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import {
	updateState,
	updateNestedStateFromEvent,
	toggleCheckbox
} from 'actions'

import RadioSet from '../form_elements/RadioSet'
import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'

const arcButtons = [
	{
		label: 'None',
		value: 'none'
	},
	{
		label: 'Fill Frame',
		value: 'fill'
	},
	{
		label: 'Fit in Frame',
		value: 'fit'
	},
	{
		label: 'Transform',
		value: 'transform'
	}
]

const backgroundMotionButtons = [
	{
		label: 'Animated',
		value: 'animated'
	},
	{
		label: 'Still',
		value: 'still'
	},
	{
		label: 'Auto',
		value: 'auto'
	}
]

const FormattingSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { editorSettings } = preferences

	const toggleCheckboxDispatch = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	const updateStateDispatch = useCallback(({ name, value }) => {
		dispatch(updateState({ [name]: value }))
	}, [])

	const updateEditorSettingsDispatch = useCallback(e => {
		dispatch(updateNestedStateFromEvent('editorSettings', e))
	}, [])

	return (
		<form>
			<fieldset>
				<legend>Default AR Correction:</legend>
				<RadioSet
					name="arc"
					state={editorSettings.arc}
					onChange={updateEditorSettingsDispatch}
					buttons={arcButtons} />
			</fieldset>
			<fieldset>
				<legend>Default Background Motion:</legend>
				<RadioSet
					name="backgroundMotion"
					state={editorSettings.backgroundMotion}
					onChange={updateEditorSettingsDispatch}
					buttons={backgroundMotionButtons} />
			</fieldset>
			<span className="input-option">
				<Checkbox
					label="Edit All Enabled by Default"
					name="editAll"
					checked={preferences.editAll}
					onChange={toggleCheckboxDispatch}
					switchIcon />
			</span>
			<span className="input-option">
				<Checkbox
					label="Show 11pm Backgrounds"
					name="enable11pmBackgrounds"
					checked={preferences.enable11pmBackgrounds}
					onChange={toggleCheckboxDispatch}
					switchIcon />
			</span>
			<span className="input-option">
				<Checkbox
					label="Enable Slider Snap Points"
					name="sliderSnapPoints"
					checked={preferences.sliderSnapPoints}
					onChange={toggleCheckboxDispatch}
					switchIcon />
			</span>
			<span className="input-option">
				<label htmlFor="split">Default Split Duration</label>
				<TimecodeInputSeconds
					name="split"
					id="split"
					value={preferences.split}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</span>
			<span className="input-option">
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
