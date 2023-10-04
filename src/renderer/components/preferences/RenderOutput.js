import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'
import { toggleCheckbox, updateState } from 'actions'

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

	const updateStateFromEvent = useCallback(e => {
		const { name, value } = e?.target || e

		dispatch(updateState({ [name]: value }))
	}, [])

	const updateConcurrent = useCallback(({ name, value }) => {
		dispatch(updateState({
			[name]: value === '' ? value : Math.trunc(value)
		}))
	}, [])

	const dispatchToggleCheckbox = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	return (
		<>
			<RadioSet
				label="Output Resolution"
				name="renderOutput"
				state={preferences.renderOutput}
				onChange={updateStateFromEvent}
				buttons={OUTPUT_BUTTONS} />
			<RadioSet
				label="Output Frame Rate"
				name="renderFrameRate"
				state={preferences.renderFrameRate}
				onChange={updateStateFromEvent}
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
							onChange={updateStateFromEvent} />
					}
				]} />
			<span className="input-option">
				<Checkbox
					label="Auto Export Still Video as .png"
					name="autoPNG"
					checked={preferences.autoPNG}
					onChange={dispatchToggleCheckbox}
					switchIcon/>
			</span>
			<span className="input-option">
				<Checkbox
					label="Filter Unsafe Characters for Aspera"
					name="asperaSafe"
					checked={preferences.asperaSafe}
					onChange={dispatchToggleCheckbox}
					switchIcon />
			</span>
			<span className="input-option">
				<Checkbox
					label="Replace Spaces with"
					name="replaceSpaces"
					checked={preferences.replaceSpaces}
					onChange={dispatchToggleCheckbox}
					Component={({ disabled }) => (
						<select
							name="spaceReplacement"
							className="panel-input"
							title="Select space replacement character"
							aria-label="Select space replacement character"
							value={preferences.spaceReplacement}
							onChange={updateStateFromEvent}
							disabled={disabled}>
							<option value="">Nothing (Remove Spaces)</option>
							<option value="-">Dashes</option>
							<option value="_">Underscores</option>
						</select>
					)}
					switchIcon />
			</span>
			<span className="input-option">
				<Checkbox
					label="Convert Case to"
					name="convertCase"
					checked={preferences.convertCase}
					onChange={dispatchToggleCheckbox}
					Component={({ disabled }) => (
						<select
							name="casing"
							className="panel-input"
							title="Select filename case"
							aria-label="Select filename case"
							value={preferences.casing}
							onChange={updateStateFromEvent}
							disabled={disabled}>
							<option value="lowercase">Lowercase</option>
							<option value="uppercase">Uppercase</option>
						</select>
					)}
					switchIcon />
			</span>
			<span className="input-option">
				<label>
					Join Batch/Preset Names with
					<select
						name="batchNameSeparator"
						className="panel-input"
						value={preferences.batchNameSeparator}
						onChange={updateStateFromEvent}>
						<option value="">Nothing</option>
						<option value=" ">Spaces</option>
						<option value="-">Dashes</option>
						<option value=" - ">Spaced Dashes</option>
						<option value="_">Underscores</option>
					</select>
				</label>
			</span>
			<span className="input-option">
				<label>
					Concurrent Renders
					<NumberInput
						name="concurrent"
						value={preferences.concurrent}
						min={1}
						max={10}
						defaultValue={2}
						microStep={1}
						onChange={updateConcurrent} />
				</label>
			</span>
		</>
	)
}

export default RenderOutput
