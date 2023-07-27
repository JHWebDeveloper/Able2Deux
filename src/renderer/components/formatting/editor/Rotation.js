import React, { memo, useCallback } from 'react'
import { bool, func, oneOf, oneOfType, number, string } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	updateMediaStateBySelection,
	updateMediaStateBySelectionFromEvent
} from 'actions'

import {
	createSettingsMenu,
	extractRotationProps,
	objectsAreEqual,
	pipe
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import FreeRotate from './FreeRotate'

const cropDirections = Object.freeze(['cropT', 'cropL', 'cropB', 'cropR'])
const transpositions = Object.freeze(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2'])
const flip = Object.freeze(['', 'hflip', 'vflip', 'hflip,vflip'])

const detectSideways = transpose => transpose === transpositions[1] || transpose === transpositions[3]
const detectOrientationChange = (prev, next) => !!(detectSideways(prev) ^ detectSideways(next))
const detectReflection = (prev, next, query) => !(!prev.includes(query) ^ next.includes(query))

const rotateCropValues = (prev, next, crop) => {
	if (prev === next) return crop
	
	const rotations = transpositions.indexOf(next) - transpositions.indexOf(prev) + 4
	const cropVals = [crop.cropT, crop.cropL, 100 - crop.cropB, 100 - crop.cropR]

	const rotated = cropDirections.reduce((obj, dir, i) => {
		obj[dir] = cropVals[(rotations + i) % 4]
		return obj
	}, {})

	rotated.cropB = 100 - rotated.cropB
	rotated.cropR = 100 - rotated.cropR

	return rotated
}

const transposeButtons = [
	{
		label: '0°',
		value: transpositions[0]
	},
	{
		label: '90°cw',
		value: transpositions[1]
	},
	{
		label: '90°ccw',
		value: transpositions[3]
	},
	{
		label: '180°',
		value: transpositions[2]
	}
]

const flipButtons = isSideways => [
	{
		label: 'None',
		value: flip[0]
	},
	{
		label: 'Horizontally',
		value: flip[isSideways ? 2 : 1]
	},
	{
		label: 'Vertically',
		value: flip[isSideways ? 1 : 2]
	},
	{
		label: 'Both',
		value: flip[3]
	}
]

const freeRotateModeButtons = [
	{
		label: 'Inside Bounds',
		value: 'inside_bounds'
	},
	{
		label: 'With Bounds',
		value: 'with_bounds'
	}
]

const Rotation = memo(props => {
	const { transpose, reflect, freeRotateMode, scaleX, scaleY, cropT, cropR, cropB, cropL, dispatch } = props
	const crop = { cropT, cropR, cropB, cropL }
	const isSideways = detectSideways(transpose)

	const updateTranspose = useCallback(e => {
		let invertedProps = {}

		if (detectOrientationChange(transpose, e.target.value)) {
			const { width, height, aspectRatio } = props

			invertedProps = {
				width: height,
				height: width,
				aspectRatio: aspectRatio.split(':').reverse().join(':'),
				scaleX: scaleY,
				scaleY: scaleX
			}
		}

		dispatch(updateMediaStateBySelection({
			...invertedProps,
			...rotateCropValues(transpose, e.target.value, crop),
			transpose: e.target.value
		}))
	}, [transpose, scaleX, scaleY, crop])

	const updateReflect = useCallback(e => {
		const invertedCrop = {}

		if (detectReflection(reflect, e.target.value, flip[1])) {
			invertedCrop.cropL = 100 - crop.cropR
			invertedCrop.cropR = 100 - crop.cropL
		}

		if (detectReflection(reflect, e.target.value, flip[2])) {
			invertedCrop.cropT = 100 - crop.cropB
			invertedCrop.cropB = 100 - crop.cropT
		}

		dispatch(updateMediaStateBySelection({
			...crop,
			...invertedCrop,
			reflect: e.target.value
		}))
	}, [reflect, crop])

	const updateOffsetMode = useCallback(e => {
		dispatch(updateMediaStateBySelectionFromEvent(e))
	}, [])

	return (
		<>
			<fieldset className="editor-option-column">
				<legend>Reflect<span aria-hidden>:</span></legend>
				<RadioSet
					name="reflect"
					state={reflect}
					onChange={updateReflect}
					buttons={flipButtons(isSideways)} />
			</fieldset>
			<fieldset className="editor-option-column">
				<legend>Rotate<span aria-hidden>:</span></legend>
				<RadioSet 
					name="transpose"
					state={transpose}
					onChange={updateTranspose}
					buttons={transposeButtons}/>
			</fieldset>
			{props.showFreeRotate ? <>
				<fieldset className="editor-option-column">
					<legend>Free Rotate Mode<span aria-hidden>:</span></legend>
					<RadioSet
						name="freeRotateMode"
						state={freeRotateMode}
						onChange={updateOffsetMode}
						buttons={freeRotateModeButtons} />
				</fieldset>
				<FreeRotate
					angle={props.angle}
					center={props.rotatedCentering}
					disableCenter={freeRotateMode === 'with_bounds'}
					dispatch={dispatch} />
			</> : <></>}
		</>
	)
}, objectsAreEqual)

const RotationPanel = props => {
	const { id, copyToClipboard, dispatch } = props

	const settingsMenu = createSettingsMenu(props, [
		() => pipe(extractRotationProps, copyToClipboard)(props),
		() => pipe(extractRotationProps, applySettingsToSelection(id), dispatch)(props),
		() => pipe(extractRotationProps, applySettingsToAll(id), dispatch)(props)
	])

	return (
		<AccordionPanel
			heading="Rotation"
			id="rotation"
			className="editor-options"
			buttons={settingsMenu}>
			<Rotation {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string,
	multipleItems: bool.isRequired,
	transpose: oneOf(transpositions),
	reflect: oneOf(flip),
	freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
	angle: number.isRequired,
	rotatedCentering: number.isRequired,
	scaleX: oneOfType([oneOf(['']), number]).isRequired,
	scaleY: oneOfType([oneOf(['']), number]).isRequired,
	cropT: oneOfType([oneOf(['']), number]).isRequired,
	cropR: oneOfType([oneOf(['']), number]).isRequired,
	cropB: oneOfType([oneOf(['']), number]).isRequired,
	cropL: oneOfType([oneOf(['']), number]).isRequired,
	aspectRatio: string.isRequired,
	width: number.isRequired,
	height: number.isRequired,
	showFreeRotate: bool.isRequired,
	dispatch: func.isRequired
}

Rotation.propTypes = propTypes
RotationPanel.propTypes = propTypes

export default RotationPanel
