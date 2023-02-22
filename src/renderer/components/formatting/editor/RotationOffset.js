import React, { useCallback } from 'react'
import { bool, func, number, string } from 'prop-types'

import { updateMediaNestedState } from 'actions'

import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const RotationOffset = ({ id, editAll, offset, axis, disableAxis, dispatch }) => {
	const updateFreeRotate = useCallback(({ value }) => {
		dispatch(updateMediaNestedState(id, 'rotation', {
			offset: value
		}, editAll))
	}, [id, editAll])

	const updateAxis= useCallback(({ value }) => {
		dispatch(updateMediaNestedState(id, 'rotation', {
			axis: value
		}, editAll))
	}, [id, editAll])

	const offsetProps = {
		value: offset,
		min: -180,
		max: 180,
		onChange: updateFreeRotate
	}

	const axisProps = {
		value: axis,
		min: -100,
		max: 100,
		disabled: disableAxis,
		onChange: updateAxis
	}

	return (
		<>
			<div>
				<label>Free Rotate</label>
				<SliderSingle {...offsetProps} snapPoints={[0]} />
				<NumberInput {...offsetProps} />
			</div>
			<div className={disableAxis ? 'disabled' : ''}>
				<label>Axis</label>
				<SliderSingle {...axisProps} snapPoints={[0]} />
				<NumberInput {...axisProps} />
			</div>
		</>
	)
}

RotationOffset.propTypes = {
	id: string.isRequired,
	editAll: bool.isRequired,
	offset: number.isRequired,
	dispatch: func.isRequired
}

export default RotationOffset
