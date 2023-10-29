import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'
import { toggleCheckbox, updateState } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'
import SelectInput from '../form_elements/SelectInput'

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

const SPACE_REPLACEMENT_OPTIONS = Object.freeze([
	{
		label: 'Nothing (Remove Spaces)',
		value: ''
	},
	{
		label: 'Dashes',
		value: '-'
	},
	{
		label: 'Underscores',
		value: '_'
	}
])

const CASE_OPTIONS = Object.freeze([
	{
		label: 'Lowercase',
		value: 'lowercase'
	},
	{
		label: 'Uppercase',
		value: 'uppercase'
	}
])

const BATCH_NAME_SEPARATOR_OPTIONS = Object.freeze([
	{
		label: 'Nothing',
		value: ''
	},
	{
		label: 'Spaces',
		value: ' '
	},
	{
		label: 'Dashes',
		value: '-'
	},
	{
		label: 'Spaced Dashes',
		value: ' - '
	},
	{
		label: 'Underscores',
		value: '_'
	}
])

const RenderOutput = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { convertCase, replaceSpaces } = preferences

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
			<Checkbox
				label="Auto Export Still Video as .png"
				name="autoPNG"
				checked={preferences.autoPNG}
				onChange={dispatchToggleCheckbox}
				switchIcon/>
			<Checkbox
				label="Filter Unsafe Filename Characters for Aspera"
				name="asperaSafe"
				checked={preferences.asperaSafe}
				onChange={dispatchToggleCheckbox}
				switchIcon />
			<Checkbox
				label="Replace Filename Spaces with"
				name="replaceSpaces"
				checked={replaceSpaces}
				onChange={dispatchToggleCheckbox}
				component={
					<SelectInput
						name="spaceReplacement"
						title="Select space replacement character"
						value={preferences.spaceReplacement}
						onChange={updateStateFromEvent}
						disabled={!replaceSpaces}
						options={SPACE_REPLACEMENT_OPTIONS} />
				}
				switchIcon />
			<Checkbox
				label="Convert Filename Case to"
				name="convertCase"
				checked={convertCase}
				onChange={dispatchToggleCheckbox}
				component={
					<SelectInput
						name="casing"
						title="Select filename case"
						value={preferences.casing}
						onChange={updateStateFromEvent}
						disabled={!convertCase}
						options={CASE_OPTIONS} />
				}
				switchIcon />
			<label className="label-with-input">
				<span>Join Batch/Preset Names with</span>
				<SelectInput
					name="batchNameSeparator"
					title="Select batch/preset name separator character"
					value={preferences.batchNameSeparator}
					onChange={updateStateFromEvent}
					options={BATCH_NAME_SEPARATOR_OPTIONS} />
			</label>
			<label className="label-with-input">
				<span>Concurrent Renders</span>
				<NumberInput
					name="concurrent"
					value={preferences.concurrent}
					min={1}
					max={10}
					defaultValue={2}
					microStep={1}
					onChange={updateConcurrent} />
			</label>
		</>
	)
}

export default RenderOutput
