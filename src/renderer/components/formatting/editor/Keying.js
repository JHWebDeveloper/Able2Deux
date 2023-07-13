import React, { useCallback, useEffect, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	copySettings,
	toggleMediaCheckbox,
	updateMediaStateBySelection,
	updateMediaStateBySelectionFromEvent
} from 'actions'

import {
	createSettingsMenu,
	extractKeyingProps,
	pipe,
	rgbToHex
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import ColorInput from '../../form_elements/ColorInput'
import NumberInput from '../../form_elements/NumberInput'
import SingleSlider from '../../form_elements/SliderSingle'
import Checkbox from '../../form_elements/Checkbox'
import EyedropperIcon from '../../svg/EyedropperIcon'

const thresholdStaticProps = { name: 'keyingThreshold', title: 'Threshold', min: 0, max: 100 }
const toleranceStaticProps = { name: 'keyingTolerance', title: 'Tolerance', min: 0, max: 100 }
const softnessStaticProps = { name: 'keyingSoftness', title: 'Softness', min: 0, max: 100 }
const similarityStaticProps = { name: 'keyingSimilarity', title: 'Similarity', min: 1, max: 100 }
const blendStaticProps = { name: 'keyingBlend', title: 'Blend', min: 0, max: 100 }

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

const Keying = props => {
	const { id, eyedropper, setEyedropper, keyingEnabled, keyingHidden, keyingType, dispatch } = props
	const { active, pixelData } = eyedropper

	const toggleKeyingCheckbox = useCallback(e => {
		dispatch(toggleMediaCheckbox(id, e))
	}, [id])

	const toggleKeying = useCallback(e => {
		if (active === 'key') {
			setEyedropper({ active: false, pixelData: false })
		}

		toggleKeyingCheckbox(e)
	}, [id, active])

	const updateKeying = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

	const updateKeyingFromEvent = useCallback(e => {
		dispatch(updateMediaStateBySelectionFromEvent(e))
	}, [])

	const selectKeyColor = useCallback(() => {
		setEyedropper(({ active }) => ({
			active: active === 'key' ? false : 'key',
			pixelData: false
		}))
	}, [])

	useEffect(() => {
		if (active === 'key' && pixelData) {
			dispatch(updateMediaStateBySelection({
				keyingColor: rgbToHex(pixelData),
				keyingHidden: false
			}))

			setEyedropper({ active: false, pixelData: false })
		}
	}, [eyedropper])

	return (
		<>
			<div className="on-off-switch">
				<Checkbox
					name="keyingEnabled"
					title={`Turn keying ${keyingEnabled ? 'off' : 'on'}`}
					checked={keyingEnabled}
					onChange={toggleKeying}
					switchIcon />
			</div>
			<fieldset
				className="editor-option-column"
				disabled={!keyingEnabled}>
				<legend>Type<span aria-hidden>:</span></legend>
				<RadioSet
					name="keyingType"
					state={keyingType}
					onChange={updateKeyingFromEvent}
					buttons={keyTypeButtons}/>
			</fieldset>
			{keyingType === 'lumakey' ? <></> : (
				<div className={keyingEnabled ? '' : 'disabled'}>
					<label id="key-color">Color<span aria-hidden>:</span></label>
					<div className="color-picker">
						<ColorInput
							name="keyingColor"
							value={props.keyingColor}
							onChange={updateKeying}
							disabled={!keyingEnabled}
							ariaLabelledby="key-color" />
						<button
							type="button"
							title="Select Key Color"
							aria-label="Select Key Color"
							className={`eyedropper-btn${active === 'key' ? ' eyedropper-active' : ''}`}
							onClick={selectKeyColor}
							disabled={!keyingEnabled}>
							<EyedropperIcon hideContents />
						</button>
						<Checkbox
							name="keyingHidden"
							title={`Show ${keyingHidden ? 'effect' : 'original'}`}
							checked={keyingHidden}
							onChange={toggleKeyingCheckbox}
							disabled={!keyingEnabled}
							visibleIcon />
					</div>
				</div>
			)}
			<div className={`color-sliders-panel${keyingEnabled ? '' : ' disabled'}`}>
				{keyingType === 'lumakey' ? (
					<LumaKeySliders
						threshold={props.keyingThreshold}
						tolerance={props.keyingTolerance}
						softness={props.keyingSoftness}
						onChange={updateKeying}
						disabled={!keyingEnabled} />
				) : (
					<ColorKeySliders
						similarity={props.keyingSimilarity}
						blend={props.keyingBlend}
						onChange={updateKeying}
						disabled={!keyingEnabled} />
				)}
			</div>
		</>
	)
}

const KeyingPanel = props => {
	const { id, dispatch } = props

	const settingsMenu = createSettingsMenu(props, [
		() => pipe(extractKeyingProps, copySettings, dispatch)(props),
		() => pipe(applySettingsToSelection(id), dispatch)(props),
		() => pipe(extractKeyingProps, applySettingsToAll(id), dispatch)(props)
	])

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
	keyingBlend: number,
	keyingColor: string,
	keyingEnabled: bool,
	keyingHidden: bool,
	keyingSimilarity: number,
	keyingSoftness: number,
	keyingThreshold: number,
	keyingTolerance: number,
	keyingType: oneOf(['colorkey', 'chromakey', 'lumakey']),
	eyedropper: exact({
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([bool, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	multipleItems: bool.isRequired,
	dispatch: func.isRequired
}

Keying.propTypes = propTypes
KeyingPanel.propTypes = propTypes

export default KeyingPanel
