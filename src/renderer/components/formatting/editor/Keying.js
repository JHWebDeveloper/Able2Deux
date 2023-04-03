import React, { useCallback, useEffect, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	toggleMediaNestedCheckbox,
	updateMediaNestedState,
	updateMediaNestedStateFromEvent
} from 'actions'

import { createSettingsMenu, rgbToHex } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import ColorInput from '../../form_elements/ColorInput'
import NumberInput from '../../form_elements/NumberInput'
import SingleSlider from '../../form_elements/SliderSingle'
import Checkbox from '../../form_elements/Checkbox'
import EyedropperIcon from '../../svg/EyedropperIcon'

const thresholdStaticProps = { name: 'threshold', title: 'Threshold', min: 0, max: 100 }
const toleranceStaticProps = { name: 'tolerance', title: 'Tolerance', min: 0, max: 100 }
const softnessStaticProps = { name: 'softness', title: 'Softness', min: 0, max: 100 }
const similarityStaticProps = { name: 'similarity', title: 'Similarity', min: 1, max: 100 }
const blendStaticProps = { name: 'blend', title: 'Blend', min: 0, max: 100 }

const keyTypeButtons = [
	{
		label: 'Color Key',
		value: 'colorkey'
	},
	{
		label: 'Chroma Key',
		value: 'chromakey'
	},
	{
		label: 'Luma Key',
		value: 'lumakey'
	}
]

const LumaKeySliders = ({ threshold, tolerance, softness, onChange, disabled }) => {
	const thresholdProps = {
		...thresholdStaticProps,
		value: threshold,
		onChange,
		disabled
	}

	const toleranceProps = {
		...toleranceStaticProps,
		value: tolerance,
		onChange,
		disabled
	}

	const softnessProps = {
		...softnessStaticProps,
		value: softness,
		onChange,
		disabled
	}

	return (
		<>
			<label>Threshold</label>
			<SingleSlider {...thresholdProps} />
			<NumberInput {...thresholdProps} />
			<label>Tolerance</label>
			<SingleSlider {...toleranceProps} />
			<NumberInput {...toleranceProps} />
			<label>Softness</label>
			<SingleSlider {...softnessProps} />
			<NumberInput {...softnessProps} />
		</>
	)
}

const ColorKeySliders = ({ similarity, blend, onChange, disabled }) => {
	const similarityProps = {
		...similarityStaticProps,
		value: similarity,
		onChange,
		disabled
	}

	const blendProps = {
		...blendStaticProps,
		value: blend,
		onChange,
		disabled
	}

	return (
		<>
			<label>Similarity</label>
			<SingleSlider {...similarityProps} />
			<NumberInput {...similarityProps} />
			<label>Blend</label>
			<SingleSlider {...blendProps} />
			<NumberInput {...blendProps} />
		</>
	)
}

const Keying = ({ id, keying, eyedropper, setEyedropper, editAll, dispatch }) => {
	const { enabled, hidden, type } = keying
	const { active, pixelData } = eyedropper

	const toggleKeyingCheckbox = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'keying', e, editAll))
	}, [id, editAll])

	const toggleKeying = useCallback(e => {
		if (active === 'key') {
			setEyedropper({ active: false, pixelData: false })
		}

		toggleKeyingCheckbox(e)
	}, [id, editAll, active])

	const updateKeying = useCallback(({ name, value }) => {
		dispatch(updateMediaNestedState(id, 'keying', {
			[name]: value
		}, editAll))
	}, [id, editAll])

	const updateKeyingFromEvent = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'keying', e, editAll))
	}, [id, editAll])

	const selectKeyColor = useCallback(() => {
		setEyedropper(({ active }) => ({
			active: active === 'key' ? false : 'key',
			pixelData: false
		}))
	}, [])

	useEffect(() => {
		if (active === 'key' && pixelData) {
			dispatch(updateMediaNestedState(id, 'keying', {
				color: rgbToHex(pixelData),
				hidden: false
			}, editAll))

			setEyedropper({ active: false, pixelData: false })
		}
	}, [id, eyedropper, editAll])

	return (
		<>
			<div className="on-off-switch">
				<Checkbox
					name="enabled"
					title={`Turn keying ${enabled ? 'off' : 'on'}`}
					checked={enabled}
					onChange={toggleKeying}
					switchIcon />
			</div>
			<fieldset
				className="editor-option-column"
				disabled={!enabled}>
				<legend>Type<span aria-hidden>:</span></legend>
				<RadioSet
					name="type"
					state={type}
					onChange={updateKeyingFromEvent}
					buttons={keyTypeButtons}/>
			</fieldset>
			{type === 'lumakey' ? <></> : (
				<div className={enabled ? '' : 'disabled'}>
					<label id="key-color">Color<span aria-hidden>:</span></label>
					<div className="color-picker">
						<ColorInput
							name="color"
							value={keying.color}
							onChange={updateKeying}
							disabled={!enabled}
							ariaLabelledby="key-color" />
						<button
							type="button"
							title="Select Key Color"
							aria-label="Select Key Color"
							className={`eyedropper-btn${active === 'key' ? ' eyedropper-active' : ''}`}
							onClick={selectKeyColor}
							disabled={!enabled}>
							<EyedropperIcon hideContents />
						</button>
						<Checkbox
							name="hidden"
							title={`Show ${hidden ? 'effect' : 'original'}`}
							checked={hidden}
							onChange={toggleKeyingCheckbox}
							disabled={!enabled}
							visibleIcon />
					</div>
				</div>
			)}
			<div className={`color-sliders-panel${enabled ? '' : ' disabled'}`}>
				{type === 'lumakey' ? (
					<LumaKeySliders
						threshold={keying.threshold}
						tolerance={keying.tolerance}
						softness={keying.softness}
						onChange={updateKeying}
						disabled={!enabled} />
				) : (
					<ColorKeySliders
						similarity={keying.similarity}
						blend={keying.blend}
						onChange={updateKeying}
						disabled={!enabled} />
				)}
			</div>
		</>
	)
}

const KeyingPanel = props => {
	const { isBatch, keying, id, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => dispatch(copySettings({ keying })),
		() => dispatch(applySettingsToAll(id, { keying }))
	]), [isBatch, id, keying])

	return (
		<AccordionPanel
			heading="Key"
			id="keying"
			className="editor-options auto-rows"
			buttons={settingsMenu}>
			<Keying {...props} />
		</AccordionPanel>
	)
}

LumaKeySliders.propTypes = {
	threshold: number.isRequired,
	tolerance: number.isRequired,
	softness: number.isRequired,
	onChange: func.isRequired,
	disabled: bool.isRequired
}

ColorKeySliders.propTypes = {
	similarity: number.isRequired,
	blend: number.isRequired,
	onChange: func.isRequired,
	disabled: bool.isRequired
}

const propTypes = {
	id: string.isRequired,
	keying: exact({
		blend: number,
		color: string,
		enabled: bool,
		hidden: bool,
		similarity: number,
		softness: number,
		threshold: number,
		tolerance: number,
		type: oneOf(['colorkey', 'chromakey', 'lumakey'])
	}).isRequired,
	eyedropper: exact({
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([bool, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	editAll: bool.isRequired,
	isBatch: bool.isRequired,
	dispatch: func.isRequired
}

Keying.propTypes = propTypes
KeyingPanel.propTypes = propTypes

export default KeyingPanel
