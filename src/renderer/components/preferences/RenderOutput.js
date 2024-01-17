import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'
import { toggleCheckbox, updateState } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'
import SelectInput from '../form_elements/SelectInput'

const OUTPUT_OPTIONS = Object.freeze([
	{
		label: '1280x720',
		value: '1280x720'
	},
	{
		label: '1920x1080',
		value: '1920x1080'
	}
])

const FRAME_RATE_OPTIONS = Object.freeze([
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

const DATE_TIME_SOURCE_OPTIONS = Object.freeze([
	{
		label: 'Import Started',
		value: 'importStarted'
	},
	{
		label: 'Import Completed',
		value: 'importCompleted'
	},
	{
		label: 'Render Started',
		value: 'renderStarted'
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

const H264_PRESET_OPTIONS = Object.freeze([
	{
		label: 'Ultra Fast',
		value: 'ultrafast'
	},
	{
		label: 'Super Fast',
		value: 'superfast'
	},
	{
		label: 'Very Fast',
		value: 'veryfast'
	},
	{
		label: 'Faster',
		value: 'faster'
	},
	{
		label: 'Fast',
		value: 'fast'
	},
	{
		label: 'Medium',
		value: 'medium'
	},
	{
		label: 'Slow',
		value: 'slow'
	}
	,
	{
		label: 'Slower',
		value: 'slower'
	},
	{
		label: 'Very Slow',
		value: 'veryslow'
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
				options={OUTPUT_OPTIONS} />
			<RadioSet
				label="Output Frame Rate"
				name="renderFrameRate"
				state={preferences.renderFrameRate}
				onChange={updateStateFromEvent}
				options={[
					...FRAME_RATE_OPTIONS,
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
			<RadioSet
				label="Date and Time Source"
				name="dateTimeSource"
				state={preferences.dateTimeSource}
				onChange={updateStateFromEvent}
				options={DATE_TIME_SOURCE_OPTIONS} />
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
				<span>H.264 Export Preset</span>
				<SelectInput
					name="h264Preset"
					title="Select H.264 Export Preset"
					value={preferences.h264Preset}
					onChange={updateStateFromEvent}
					options={H264_PRESET_OPTIONS} />
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
