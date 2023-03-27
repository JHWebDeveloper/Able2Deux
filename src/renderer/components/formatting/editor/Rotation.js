import React, { useCallback, useMemo } from 'react'
import { bool, exact, func, oneOf, object, number, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	updateMediaState,
	updateMediaNestedStateFromEvent
} from 'actions'

import { createSettingsMenu } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import FreeRotate from './FreeRotate'

const directions = Object.freeze(['t', 'l', 'b', 'r'])
const transpositions = Object.freeze(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2'])
const flip = Object.freeze(['', 'hflip', 'vflip', 'hflip,vflip'])

const detectSideways = transpose => transpose === transpositions[1] || transpose === transpositions[3]
const detectOrientationChange = (prev, next) => !!(detectSideways(prev) ^ detectSideways(next))
const detectReflection = (prev, next, query) => !(!prev.includes(query) ^ next.includes(query))

const rotateCropValues = (prev, next, crop) => {
	if (prev === next) return crop
	
	const rotations = transpositions.indexOf(next) - transpositions.indexOf(prev) + 4
	const cropVals = [crop.t, crop.l, 100 - crop.b, 100 - crop.r]

	const rotated = directions.reduce((obj, dir, i) => {
		obj[dir] = cropVals[(rotations + i) % 4]
		return obj
	}, {})

	rotated.b = 100 - rotated.b
	rotated.r = 100 - rotated.r

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

const Rotation = props => {
	const { id, rotation, scale, crop, editAll, dispatch } = props
	const { reflect, transpose } = rotation
	const isSideways = detectSideways(transpose)

	const updateAngle = useCallback(e => {
		let invertedProps = {}

		if (detectOrientationChange(transpose, e.target.value)) {
			const { width, height, aspectRatio } = props

			invertedProps = {
				width: height,
				height: width,
				aspectRatio: aspectRatio.split(':').reverse().join(':'),
				scale: {
					...scale,
					x: scale.y,
					y: scale.x
				}
			}
		}

		dispatch(updateMediaState(id, {
			...invertedProps,
			crop: {
				...crop,
				...rotateCropValues(transpose, e.target.value, crop)
			},
			rotation: {
				...rotation,
				transpose: e.target.value
			}
		}, editAll))
	}, [id, rotation, scale, crop, editAll])

	const updateReflect = useCallback(e => {
		const invertedCrop = {}

		if (detectReflection(reflect, e.target.value, flip[1])) {
			invertedCrop.l = 100 - crop.r
			invertedCrop.r = 100 - crop.l
		}

		if (detectReflection(reflect, e.target.value, flip[2])) {
			invertedCrop.t = 100 - crop.b
			invertedCrop.b = 100 - crop.t
		}

		dispatch(updateMediaState(id, {
			crop: {
				...crop,
				...invertedCrop
			},
			rotation: {
				...rotation,
				reflect: e.target.value
			}
		}, editAll))
	}, [id, rotation, crop, editAll])

	const updateOffsetMode = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'rotation', e, editAll))
	}, [id, editAll])

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
					onChange={updateAngle}
					buttons={transposeButtons}/>
			</fieldset>
			{props.showOffset ? <>
				<fieldset className="editor-option-column">
					<legend>Free Rotate Mode<span aria-hidden>:</span></legend>
					<RadioSet
						name="freeRotateMode"
						state={rotation.freeRotateMode}
						onChange={updateOffsetMode}
						buttons={freeRotateModeButtons} />
				</fieldset>
				<FreeRotate
					id={id}
					editAll={editAll}
					angle={rotation.angle}
					center={rotation.center}
					disableAxis={rotation.freeRotateMode === 'with_bounds'}
					dispatch={dispatch} />
			</> : <></>}
		</>
	)
}

const RotationPanel = props => {
	const { isBatch, id, rotation, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => dispatch(copySettings({ rotation })),
		() => dispatch(applySettingsToAll(id, { rotation }))
	]), [isBatch, id, rotation])

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
	id: string.isRequired,
	isBatch: bool.isRequired,
	rotation: exact({
		transpose: oneOf(transpositions),
		reflect: oneOf(flip),
		freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
		angle: number,
		center: number
	}).isRequired,
	scale: object.isRequired,
	crop: object.isRequired,
	aspectRatio: string.isRequired,
	width: number.isRequired,
	height: number.isRequired,
	editAll: bool.isRequired,
	showOffset: bool.isRequired,
	dispatch: func.isRequired
}

Rotation.propTypes = propTypes
RotationPanel.propTypes = propTypes

export default RotationPanel
