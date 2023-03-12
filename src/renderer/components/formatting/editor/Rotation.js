import React, { useCallback, useMemo } from 'react'
import { bool, exact, func, oneOf, object, number, string } from 'prop-types'

import {
	updateMediaState,
	updateMediaNestedStateFromEvent,
	copySettings,
	applySettingsToAll
} from 'actions'

import { createSettingsMenu } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import FreeRotate from './FreeRotate'

const directions = Object.freeze(['t', 'l', 'b', 'r'])
const transpose = Object.freeze(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2'])
const flip = Object.freeze(['', 'hflip', 'vflip', 'hflip,vflip'])

const detectSideways = angle => angle === transpose[1] || angle === transpose[3]
const detectOrientationChange = (prev, next) => !!(detectSideways(prev) ^ detectSideways(next))
const detectReflection = (prev, next, query) => !(!prev.includes(query) ^ next.includes(query))

const rotateCropValues = (prev, next, crop) => {
	if (prev === next) return crop
	
	const rotations = transpose.indexOf(next) - transpose.indexOf(prev) + 4
	const cropVals = [crop.t, crop.l, 100 - crop.b, 100 - crop.r]

	const rotated = directions.reduce((obj, dir, i) => {
		obj[dir] = cropVals[(rotations + i) % 4]
		return obj
	}, {})

	rotated.b = 100 - rotated.b
	rotated.r = 100 - rotated.r

	return rotated
}

const angleButtons = [
	{
		label: '0°',
		value: transpose[0]
	},
	{
		label: '90°cw',
		value: transpose[1]
	},
	{
		label: '90°ccw',
		value: transpose[3]
	},
	{
		label: '180°',
		value: transpose[2]
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

const offsetModeButtons = [
	{
		label: 'Cover Bounds',
		value: 'cover'
	},
	{
		label: 'Preserve',
		value: 'preserve'
	}
]

const Rotation = props => {
	const { id, rotation, scale, crop, editAll, dispatch } = props
	const { reflect, angle } = rotation
	const isSideways = detectSideways(angle)

	const updateAngle = useCallback(e => {
		let invertedProps = {}

		if (detectOrientationChange(angle, e.target.value)) {
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
				...rotateCropValues(angle, e.target.value, crop)
			},
			rotation: {
				...rotation,
				angle: e.target.value
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
					name="angle"
					state={angle}
					onChange={updateAngle}
					buttons={angleButtons}/>
			</fieldset>
			{props.showOffset ? <>
				<fieldset className="editor-option-column">
					<legend>Free Mode<span aria-hidden>:</span></legend>
					<RadioSet
						name="offsetMode"
						state={rotation.offsetMode}
						onChange={updateOffsetMode}
						buttons={offsetModeButtons} />
				</fieldset>
				<FreeRotate
					id={id}
					editAll={editAll}
					offset={rotation.offset}
					axis={rotation.axis}
					disableAxis={rotation.offsetMode !== 'cover'}
					dispatch={dispatch} />
			</> : <></>}
		</>
	)
}

const RotationPanel = props => {
	const { isBatch, id, rotation, dispatch } = props

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({ rotation })),
		() => dispatch(applySettingsToAll(id, { rotation }))
	]) : [], [isBatch, id, rotation])

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
		angle: oneOf(transpose),
		reflect: oneOf(flip),
		offsetMode: oneOf(['contain', 'cover', 'preserve']),
		offset: number
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
