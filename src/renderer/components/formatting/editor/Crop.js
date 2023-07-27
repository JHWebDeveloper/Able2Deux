import React, { memo, useCallback, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	toggleMediaCheckbox,
	updateMediaStateBySelection
} from 'actions'

import {
	clamp,
	createSettingsMenu,
	extractCropProps,
	objectsAreEqual,
	pipe
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderDouble from '../../form_elements/SliderDouble'
import NumberInput from '../../form_elements/NumberInput'
import LinkIcon from '../../svg/LinkIcon'

const propsTStatic = { name: 'cropT', title: 'Crop Top' }
const propsBStatic = { name: 'cropB', title: 'Crop Bottom' }
const propsLStatic = { name: 'cropL', title: 'Crop Left' }
const propsRStatic = { name: 'cropR', title: 'Crop Right' }

const sliderProps = {
	snapPoints: [50],
	sensitivity: 2,
	enableAutoCenter: true
}

const Crop = memo(props => {
	const { id, cropT, cropR, cropB, cropL, cropLinkTB, cropLinkLR, dispatch } = props

	const updateCrop = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

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

	const toggleCropLink = useCallback(e => {
		dispatch(toggleMediaCheckbox(id, e))
	}, [id])

	const propsTB = useMemo(() => ({
		onChange: cropLinkTB
			? vals => updateCropBiDirectional('cropT', 'cropB', vals)
			: updateCrop
	}), [cropLinkTB, cropT, cropB])

	const propsLR = useMemo(() => ({
		onChange: cropLinkLR
			? vals => updateCropBiDirectional('cropL', 'cropR', vals)
			: updateCrop
	}), [cropLinkLR, cropL, cropR])

	const propsT = {
		...propsTStatic,
		...propsTB,
		value: cropT
	}

	const propsB = {
		...propsBStatic,
		...propsTB,
		value: cropB
	}

	const propsL = {
		...propsLStatic,
		...propsLR,
		value: cropL
	}

	const propsR = {
		...propsRStatic,
		...propsLR,
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
				{...sliderProps} />
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
				onClick={toggleCropLink}>
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
				{...sliderProps} />
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
				onClick={toggleCropLink}>
				<LinkIcon linked={cropLinkLR} single />
			</button>
		</>
	)
}, objectsAreEqual)

const CropPanel = props => {
	const { id, copyToClipboard, dispatch } = props

	const settingsMenu = createSettingsMenu(props, [
		() => pipe(extractCropProps, copyToClipboard)(props),
		() => pipe(extractCropProps, applySettingsToSelection(id), dispatch)(props),
		() => pipe(extractCropProps, applySettingsToAll(id), dispatch)(props)
	])

	return (
		<AccordionPanel
			heading="Crop"
			id="crop"
			className="editor-options auto-rows"
			buttons={settingsMenu}>
			<Crop {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	cropT: oneOfType([oneOf(['']), number]).isRequired,
	cropB: oneOfType([oneOf(['']), number]).isRequired,
	cropR: oneOfType([oneOf(['']), number]).isRequired,
	cropL: oneOfType([oneOf(['']), number]).isRequired,
	cropLinkTB: bool.isRequired,
	cropLinkLR: bool.isRequired,
	copyToClipboard: func.isRequired,
	dispatch: func.isRequired
}

Crop.propTypes = propTypes
CropPanel.propTypes = propTypes

export default CropPanel
