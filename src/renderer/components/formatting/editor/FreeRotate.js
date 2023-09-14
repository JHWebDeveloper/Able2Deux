import React from 'react'
import { bool, func, number } from 'prop-types'

import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const ANGLE_STATIC_PROPS = { name: 'angle', title: 'Angle', min: -180, max: 180 }
const CENTERING_STATIC_PROPS = { name: 'rotatedCentering', title: 'Centering', min: -100, max: 100 }

const FreeRotate = ({ angle, center, disableCenter, updateSelectionFromEvent }) => {
	const angleProps = {
		...ANGLE_STATIC_PROPS,
		value: angle,
		onChange: updateSelectionFromEvent
	}

	const centeringProps = {
		...CENTERING_STATIC_PROPS,
		value: center,
		disabled: disableCenter,
		onChange: updateSelectionFromEvent
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
				<SliderSingle {...centeringProps} snapPoints={[0]} />
				<NumberInput {...centeringProps} />
			</div>
		</>
	)
}

FreeRotate.propTypes = {
	angle: number.isRequired,
	center: number.isRequired,
	disableCenter: bool.isRequired,
	updateSelectionFromEvent: func.isRequired
}

export default FreeRotate
