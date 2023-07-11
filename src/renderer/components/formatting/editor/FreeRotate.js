import React, { useCallback } from 'react'
import { bool, func, number, string } from 'prop-types'

import { updateMediaStateBySelection } from 'actions'

import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const FreeRotate = ({ angle, center, disableCenter, dispatch }) => {
	const updateAngle = useCallback(({ value }) => {
		dispatch(updateMediaStateBySelection({
			angle: value
		}))
	}, [])

	const updateCentering= useCallback(({ value }) => {
		dispatch(updateMediaStateBySelection({
			rotatedCentering: value
		}))
	}, [])

	const angleProps = {
		value: angle,
		min: -180,
		max: 180,
		onChange: updateAngle
	}

	const centerProps = {
		value: center,
		min: -100,
		max: 100,
		disabled: disableCenter,
		onChange: updateCentering
	}

	return (
		<>
			<div>
				<label>Free Rotate</label>
				<SliderSingle {...angleProps} snapPoints={[-90, 0, 90]} />
				<NumberInput {...angleProps} />
			</div>
			<div className={disableCenter ? 'disabled' : ''}>
				<label>Centering</label>
				<SliderSingle {...centerProps} snapPoints={[0]} />
				<NumberInput {...centerProps} />
			</div>
		</>
	)
}

FreeRotate.propTypes = {
	angle: number.isRequired,
	center: number.isRequired,
	disableCenter: bool.isRequired,
	dispatch: func.isRequired
}

export default FreeRotate
