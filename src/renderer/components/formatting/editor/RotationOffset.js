import React, { useCallback } from 'react'

import { updateMediaNestedState } from 'actions'

import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const RotationOffset = ({ id, editAll, rotation, dispatch }) => {
	const updateOffset = useCallback(({ value }) => {
		dispatch(updateMediaNestedState(id, 'rotation', {
			offset: value
		}, editAll))
	}, [id, editAll])

	const offsetProps = {
		value: rotation.offset,
		min: -45,
		max: 45,
		onChange: updateOffset
	}

	return (
		<fieldset>
			<legend>Offset:</legend>
			<div className="single-slider-grid">
				<SliderSingle {...offsetProps} snapPoints={[0]} />
				<NumberInput {...offsetProps} />
			</div>
		</fieldset>
	)
}

export default RotationOffset
