import React, { memo, useCallback } from 'react'
import { bool, exact, func, oneOf, object, number, string } from 'prop-types'

import { updateMediaState } from '../../../actions'
import { copySettings, applySettingsToAll } from '../../../actions/render'
import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'

const transpose = ['', 'transpose=1,', 'transpose=2,transpose=2,', 'transpose=2,']
const flip = ['', 'hflip,', 'vflip,', 'hflip,vflip,']
const by90 = /^transpose=(1|2),$/

const detectOrientationChange = (prev, next) => !!(by90.test(prev) ^ by90.test(next))
const detectReflection = (prev, next, match) => !(!prev.includes(match) ^ next.includes(match))

const rotateCropValues = (prev, next, crop) => {
	if (prev === next) return crop
	
	const { t, l, b, r } = crop
	const cropVals = [t, l, b, r]
	const dist = transpose.indexOf(next) - transpose.indexOf(prev) + 4

	return {
		t: cropVals[dist % 4],
		l: cropVals[(dist + 1) % 4],
		b: cropVals[(dist + 2) % 4],
		r: cropVals[(dist + 3) % 4]
	} 
}

const Rotation = memo(props => {
	const { id, isBatch, rotation, scale, crop, editAll, dispatch } = props

	const updateAngle = useCallback(e => {
		let invertedProps = {}

		if (detectOrientationChange(rotation.angle, e.target.value)) {
			const { width, height, aspectRatio } = props

			invertedProps = {
				width: height,
				height: width,
				aspectRatio: aspectRatio.split(':').reverse().join(':'),
				scale: {
					x: scale.y,
					y: scale.x,
					link: scale.link
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
			invertedCrop.l = crop.r
			invertedCrop.r = crop.l
		}

		if (detectReflection(rotation.reflect, e.target.value, flip[2])) {
			invertedCrop.t = crop.b
			invertedCrop.b = crop.t
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
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ rotation })),
				() => dispatch(applySettingsToAll(id, { rotation }))
			])}>
			<fieldset>
				<legend>Rotate:</legend>
				<RadioSet 
					name="angle"
					state={rotation.angle}
					onChange={updateAngle}
					buttons={[
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
					]}/>
			</fieldset>
			<fieldset>
				<legend>Reflect:</legend>
				<RadioSet
					name="reflect"
					state={rotation.reflect}
					onChange={updateReflect}
					buttons={[
						{
							label: 'None',
							value: flip[0]
						},
						{
							label: 'Horizontally',
							value: flip[1]
						},
						{
							label: 'Vertically',
							value: flip[2]
						},
						{
							label: 'Both',
							value: flip[3]
						}
					]} />
			</fieldset>
		</DetailsWrapper>
	)
}, compareProps)

Rotation.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	rotation: exact({
		angle: oneOf(transpose),
		reflect: oneOf(flip)
	}).isRequired,
	scale: object.isRequired,
	crop: object.isRequired,
	aspectRatio: string.isRequired,
	width: number.isRequired,
	height: number.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Rotation
