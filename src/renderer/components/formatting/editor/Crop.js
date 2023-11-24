import React, { memo, useCallback, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	cropSelected,
	saveAsPreset,
	updateMediaStateBySelection
} from 'actions'

import {
	clamp,
	createObjectPicker,
	createSettingsMenu,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderDouble from '../../form_elements/SliderDouble'
import NumberInput from '../../form_elements/NumberInput'
import LinkIcon from '../../svg/LinkIcon'

const T_STATIC_PROPS = Object.freeze({ name: 'cropT', title: 'Crop Top' })
const B_STATIC_PROPS = Object.freeze({ name: 'cropB', title: 'Crop Bottom' })
const L_STATUC_PROPS = Object.freeze({ name: 'cropL', title: 'Crop Left' })
const R_STATIC_PROPS = Object.freeze({ name: 'cropR', title: 'Crop Right' })

const SLIDER_STATIC_PROPS = Object.freeze({
	snapPoints: [50],
	sensitivity: 2,
	enableAutoCenter: true
})

const extractCropProps = createObjectPicker(['cropT', 'cropL', 'cropB', 'cropR', 'cropLinkTB', 'cropLinkLR'])

const Crop = memo(props => {
	const {
		cropT,
		cropR,
		cropB,
		cropL,
		cropLinkTB,
		cropLinkLR,
		multipleItemsSelected,
		updateSelectionFromEvent,
		toggleSelectionCheckbox,
		dispatch
	} = props

	const updateCropMultiSelection = useCallback(e => {
		const { name, value } = e?.target || e

		dispatch(cropSelected(name, value))
	})

	const updateCropBiDirectional = useCallback((d1, d2, { name, value }) => {
		const isD1 = name === d1
		const compliment = props[d2] - value + props[d1]
		const bound = props[d1] + (props[d2] - props[d1]) / 2

		dispatch(updateMediaStateBySelection({
			[d1]: clamp(isD1 ? value : compliment, 0, bound - 0.025),
			[d2]: clamp(isD1 ? compliment : value, bound + 0.025, 100)
		}))
	}, [cropT, cropR, cropB, cropL])

	const pan = useCallback((d1, d2, { valueL, valueR }) => {
		dispatch(updateMediaStateBySelection({
			[d1]: valueL,
			[d2]: valueR
		}))
	}, [])

	const panX = useCallback(values => pan('cropL', 'cropR', values), [])
	const panY = useCallback(values => pan('cropT', 'cropB', values), [])

	const TBProps = useMemo(() => ({
		onChange: cropLinkTB
			? vals => updateCropBiDirectional('cropT', 'cropB', vals)
			: multipleItemsSelected
				? updateCropMultiSelection
				: updateSelectionFromEvent
	}), [cropLinkTB, cropT, cropB, multipleItemsSelected])

	const LRProps = useMemo(() => ({
		onChange: cropLinkLR
			? vals => updateCropBiDirectional('cropL', 'cropR', vals)
			: multipleItemsSelected
				? updateCropMultiSelection
				: updateSelectionFromEvent
	}), [cropLinkLR, cropL, cropR, multipleItemsSelected])

	const propsT = {
		...T_STATIC_PROPS,
		...TBProps,
		value: cropT
	}

	const propsB = {
		...B_STATIC_PROPS,
		...TBProps,
		value: cropB
	}

	const propsL = {
		...L_STATUC_PROPS,
		...LRProps,
		value: cropL
	}

	const propsR = {
		...R_STATIC_PROPS,
		...LRProps,
		value: cropR
	}

	const linkTBTitle = `${cropLinkTB ? 'Unl' : 'L'}ink top and bottom`
	const linkLRTitle = `${cropLinkLR ? 'Unl' : 'L'}ink left and right`

	return (
		<>
			<label>T</label>
			<NumberInput
				max={cropB - 0.05}
				defaultValue={0}
				{...propsT} />
			<SliderDouble
				leftThumb={propsT}
				rightThumb={propsB}
				onPan={panY}
				middleThumbTitle="Pan Y"
				{...SLIDER_STATIC_PROPS} />
			<NumberInput
				min={cropT + 0.05}
				defaultValue={100}
				{...propsB} />
			<label>B</label>
			<button
				type="button"
				name="cropLinkTB"
				className="link-button"
				title={linkTBTitle}
				aria-label={linkTBTitle}
				onClick={toggleSelectionCheckbox}>
				<LinkIcon linked={cropLinkTB} single />
			</button>
			<label>L</label>
			<NumberInput
				max={cropR - 0.05}
				defaultValue={0}
				{...propsL} />
			<SliderDouble
				leftThumb={propsL}
				rightThumb={propsR}
				onPan={panX}
				middleThumbTitle="Pan X"
				{...SLIDER_STATIC_PROPS} />
			<NumberInput
				min={cropL + 0.05}
				defaultValue={100}
				{...propsR} />
			<label>R</label>
			<button
				type="button"
				name="cropLinkLR"
				className="link-button"
				title={linkLRTitle}
				aria-label={linkLRTitle}
				onClick={toggleSelectionCheckbox}>
				<LinkIcon linked={cropLinkLR} single />
			</button>
		</>
	)
}, objectsAreEqual)

const CropPanel = ({ id, multipleItems, ...rest }) => {
	const { multipleItemsSelected, dispatch } = rest

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractCropProps)),
			() => dispatch(applyToSelection(id, extractCropProps)),
			() => dispatch(applyToAll(id, extractCropProps)),
			() => dispatch(saveAsPreset(id, extractCropProps))
		])
	), [multipleItems, multipleItemsSelected, id])

	return (
		<AccordionPanel
			heading="Crop"
			id="crop"
			className="editor-options auto-rows"
			options={settingsMenu}>
			<Crop {...rest} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	cropT: oneOfType([oneOf(['']), number]).isRequired,
	cropB: oneOfType([oneOf(['']), number]).isRequired,
	cropR: oneOfType([oneOf(['']), number]).isRequired,
	cropL: oneOfType([oneOf(['']), number]).isRequired,
	cropLinkTB: bool.isRequired,
	cropLinkLR: bool.isRequired,
	updateSelectionFromEvent: func.isRequired,
	toggleSelectionCheckbox: func.isRequired,
	dispatch: func.isRequired
}

Crop.propTypes = propTypes
CropPanel.propTypes = propTypes

export default CropPanel
