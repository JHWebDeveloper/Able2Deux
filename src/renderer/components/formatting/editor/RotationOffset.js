import React, { useCallback } from 'react'
import { bool, func, number, string } from 'prop-types'

import { updateMediaNestedState } from 'actions'

import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const RotationOffset = ({ id, editAll, offset, dispatch }) => {
	const updateOffset = useCallback(({ value }) => {
		dispatch(updateMediaNestedState(id, 'rotation', {
			offset: value
		}, editAll))
	}, [id, editAll])

	const offsetProps = {
		value: offset,
		min: -45,
		max: 45,
		onChange: updateOffset
	}

	return (
		<fieldset>
			<legend>Offset<span aria-hidden>:</span></legend>
			<div className="offset-grid">
				<SliderSingle {...offsetProps} snapPoints={[0]} />
				<NumberInput {...offsetProps} />
			</div>
		</fieldset>
	)
}

RotationOffset.propTypes = {
	id: string.isRequired,
	editAll: bool.isRequired,
	offset: number.isRequired,
	dispatch: func.isRequired
}

export default RotationOffset
