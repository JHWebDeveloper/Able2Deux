import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import {
	toggleCheckbox,
	updateEditorSettings,
	updateState
} from 'actions'

import { RADIO_SET } from 'constants'

import RadioSet from '../form_elements/RadioSet'
import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import TimecodeInputSeconds from '../form_elements/TimecodeInputSeconds'

const BACKGROUND_MOTION_BUTTONS = Object.freeze([
	...RADIO_SET.backgroundMotion,
	{
		label: 'Auto',
		value: 'auto'
	}
])

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
		dispatch(updateEditorSettings(e))
	}, [])

	return (
		<>
			<RadioSet
				label="Default AR Correction"
				name="arc"
				state={editorSettings.arc}
				onChange={updateEditorSettingsDispatch}
				buttons={RADIO_SET.arc} />
			<RadioSet
				label="Default Background Motion"
				name="backgroundMotion"
				state={editorSettings.backgroundMotion}
				onChange={updateEditorSettingsDispatch}
				buttons={BACKGROUND_MOTION_BUTTONS} />
			<Checkbox
				label="Select All by Default"
				name="selectAllByDefault"
				checked={preferences.selectAllByDefault}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<Checkbox
				label="Show 11pm Backgrounds"
				name="enable11pmBackgrounds"
				checked={preferences.enable11pmBackgrounds}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<Checkbox
				label="Enable Slider Snap Points"
				name="sliderSnapPoints"
				checked={preferences.sliderSnapPoints}
				onChange={toggleCheckboxDispatch}
				switchIcon />
			<label className="label-with-input">
				<span>Default Split Duration</span>
				<TimecodeInputSeconds
					name="split"
					value={preferences.split}
					min={1}
					max={86399}
					onChange={updateStateDispatch} />
			</label>
			<label className="label-with-input">
				<span>Scale Slider Max</span>
				<NumberInput
					name="scaleSliderMax"
					value={preferences.scaleSliderMax}
					min={100}
					max={4500}
					microStep={1}
					defaultValue={400}
					onChange={updateStateDispatch} />
			</label>
		</>
	)
}

export default FormattingSettings
