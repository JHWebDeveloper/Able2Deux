import React, { useCallback } from 'react'
import { bool, func, number, string } from 'prop-types'

import { updateMediaNestedState } from 'actions'

import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const FreeRotate  = ({ id, editAll, angle, center, disableAxis, dispatch }) => {
	const updateFreeRotate = useCallback(({ value }) => {
		dispatch(updateMediaNestedState(id, 'rotation', {
			angle: value
		}, editAll))
	}, [id, editAll])

	const updateAxis= useCallback(({ value }) => {
		dispatch(updateMediaNestedState(id, 'rotation', {
			center: value
		}, editAll))
	}, [id, editAll])

	const angleProps = {
		value: angle,
		min: -180,
		max: 180,
		onChange: updateFreeRotate
	}

	const centerProps = {
		value: center,
		min: -100,
		max: 100,
		disabled: disableAxis,
		onChange: updateAxis
	}

	return (
		<>
			<div>
				<label>Free Rotate</label>
				<SliderSingle {...angleProps} snapPoints={[-90, 0, 90]} />
				<NumberInput {...angleProps} />
			</div>
			<div className={disableAxis ? 'disabled' : ''}>
				<label>Centering</label>
				<SliderSingle {...centerProps} snapPoints={[0]} />
				<NumberInput {...centerProps} />
			</div>
		</>
	)
}

FreeRotate.propTypes = {
	id: string.isRequired,
	editAll: bool.isRequired,
	angle: number.isRequired,
	center: number.isRequired,
	dispatch: func.isRequired
}

export default FreeRotate
