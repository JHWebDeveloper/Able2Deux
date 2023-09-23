import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset,
	updateMediaStateBySelection
} from 'actions'

import {
	createObjectPicker,
	createSettingsMenu,
	extractRelevantMediaProps,
	objectsAreEqual,
	rgbToHex
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import ColorInput from '../../form_elements/ColorInput'
import NumberInput from '../../form_elements/NumberInput'
import SingleSlider from '../../form_elements/SliderSingle'
import Checkbox from '../../form_elements/Checkbox'
import EyedropperIcon from '../../svg/EyedropperIcon'

const THRESHOLD_STATIC_PROPS = Object.freeze({ name: 'keyingThreshold', title: 'Threshold', min: 0, max: 100 })
const TOLERANCE_STATIC_PROPS = Object.freeze({ name: 'keyingTolerance', title: 'Tolerance', min: 0, max: 100 })
const SOFTNESS_STATIC_PROPS = Object.freeze({ name: 'keyingSoftness', title: 'Softness', min: 0, max: 100 })
const SIMILARITY_STATIC_PROPS = Object.freeze({ name: 'keyingSimilarity', title: 'Similarity', min: 1, max: 100 })
const BLEND_STATIC_PROPS = Object.freeze({ name: 'keyingBlend', title: 'Blend', min: 0, max: 100 })

const KEY_TYPE_BUTTONS = Object.freeze([
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
])

const LumaKeySliders = ({ threshold, tolerance, softness, onChange, disabled }) => {
	const thresholdProps = {
		...THRESHOLD_STATIC_PROPS,
		value: threshold,
		onChange,
		disabled
	}

	const toleranceProps = {
		...TOLERANCE_STATIC_PROPS,
		value: tolerance,
		onChange,
		disabled
	}

	const softnessProps = {
		...SOFTNESS_STATIC_PROPS,
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
		...SIMILARITY_STATIC_PROPS,
		value: similarity,
		onChange,
		disabled
	}

	const blendProps = {
		...BLEND_STATIC_PROPS,
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

const extractKeyingProps = createObjectPicker([
	'keyingEnabled',
	'keyingType',
	'keyingColor',
	'keyingSimilarity',
	'keyingBlend',
	'keyingThreshold',
	'keyingTolerance',
	'keyingSoftness'
])

const Keying = memo(props => {
	const { id, eyedropper, setEyedropper, keyingEnabled, keyingHidden, keyingType, updateSelectionFromEvent, toggleSelectionCheckbox, dispatch } = props
	const { active, pixelData } = eyedropper

	const toggleKeying = useCallback(e => {
		if (active === 'key') {
			setEyedropper({ active: false, pixelData: false })
		}

		toggleSelectionCheckbox(e)
	}, [id, active])

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
			<RadioSet
				label="Type"
				name="keyingType"
				disabled={!keyingEnabled}
				state={keyingType}
				onChange={updateSelectionFromEvent}
				buttons={KEY_TYPE_BUTTONS}/>
			{keyingType === 'lumakey' ? <></> : (
				<div className={keyingEnabled ? '' : 'disabled'}>
					<label id="key-color">Color<span aria-hidden>:</span></label>
					<div className="color-picker">
						<ColorInput
							name="keyingColor"
							value={props.keyingColor}
							onChange={updateSelectionFromEvent}
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
							onChange={toggleSelectionCheckbox}
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
						onChange={updateSelectionFromEvent}
						disabled={!keyingEnabled} />
				) : (
					<ColorKeySliders
						similarity={props.keyingSimilarity}
						blend={props.keyingBlend}
						onChange={updateSelectionFromEvent}
						disabled={!keyingEnabled} />
				)}
			</div>
		</>
	)
}, objectsAreEqual)

const KeyingPanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractRelevantMediaProps, extractKeyingProps)),
			() => dispatch(applyToSelection(id, extractRelevantMediaProps, extractKeyingProps)),
			() => dispatch(applyToAll(id, extractRelevantMediaProps, extractKeyingProps)),
			() => dispatch(saveAsPreset(id, extractRelevantMediaProps, extractKeyingProps))
		])
	), [multipleItems, multipleItemsSelected, id])

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
	keyingBlend: number.isRequired,
	keyingColor: string.isRequired,
	keyingEnabled: bool.isRequired,
	keyingHidden: bool.isRequired,
	keyingSimilarity: number.isRequired,
	keyingSoftness: number.isRequired,
	keyingThreshold: number.isRequired,
	keyingTolerance: number.isRequired,
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
	multipleItemsSelected: bool.isRequired,
	updateSelectionFromEvent: func.isRequired,
	toggleSelectionCheckbox: func.isRequired,
	dispatch: func.isRequired
}

Keying.propTypes = propTypes
KeyingPanel.propTypes = propTypes

export default KeyingPanel
