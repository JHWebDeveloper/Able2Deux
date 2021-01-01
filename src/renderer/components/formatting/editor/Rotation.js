import React, { memo, useCallback, useMemo } from 'react'
import { bool, exact, func, oneOf, object, number, string } from 'prop-types'

import {
	updateMediaState,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'
import RotationOffset from './RotationOffset'

const directions = Object.freeze(['t', 'l', 'b', 'r'])
const transpose = Object.freeze(['', 'transpose=1,', 'transpose=2,transpose=2,', 'transpose=2,'])
const flip = Object.freeze(['', 'hflip,', 'vflip,', 'hflip,vflip,'])

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

const Rotation = memo(props => {
	const { id, isBatch, rotation, scale, crop, editAll, dispatch } = props
	const isSideways = detectSideways(rotation.angle)

	const settingsMenu = useMemo(() => isBatch && createSettingsMenu([
		() => dispatch(copySettings({ rotation })),
		() => dispatch(applySettingsToAll(id, { rotation }))
	]), [isBatch, id, rotation])

	const updateAngle = useCallback(e => {
		let invertedProps = {}

		if (detectOrientationChange(rotation.angle, e.target.value)) {
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
				...rotateCropValues(rotation.angle, e.target.value, crop)
			},
			rotation: {
				...rotation,
				angle: e.target.value
			}
		}, editAll))
	}, [id, rotation, scale, crop, editAll])

	const updateReflect = useCallback(e => {
		const invertedCrop = {}

		if (detectReflection(rotation.reflect, e.target.value, flip[1])) {
			invertedCrop.l = 100 - crop.r
			invertedCrop.r = 100 - crop.l
		}

		if (detectReflection(rotation.reflect, e.target.value, flip[2])) {
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

	return (
		<DetailsWrapper
			summary="Rotation"
			className="auto-columns"
			buttons={settingsMenu}>
			<fieldset>
				<legend>Reflect:</legend>
				<RadioSet
					name="reflect"
					state={rotation.reflect}
					onChange={updateReflect}
					buttons={flipButtons(isSideways)} />
			</fieldset>
			<fieldset>
				<legend>Rotate:</legend>
				<RadioSet 
					name="angle"
					state={rotation.angle}
					onChange={updateAngle}
					buttons={angleButtons}/>
			</fieldset>
			{props.arc === 'transform' && (
				<RotationOffset
					id={id}
					editAll={editAll}
					offset={rotation.offset}
					dispatch={dispatch} />
			)}
		</DetailsWrapper>
	)
}, compareProps)

Rotation.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	rotation: exact({
		angle: oneOf(transpose),
		reflect: oneOf(flip),
		offset: number
	}).isRequired,
	scale: object.isRequired,
	crop: object.isRequired,
	aspectRatio: string.isRequired,
	width: number.isRequired,
	height: number.isRequired,
	editAll: bool.isRequired,
	arc: oneOf(['none', 'fill', 'fit', 'transform']),
	dispatch: func.isRequired
}

export default Rotation
