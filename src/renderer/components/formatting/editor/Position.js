import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	updateMediaNestedStateFromEvent,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Slider from '../../form_elements/Slider'

const Position = memo(({ id, isBatch, position, editAll, dispatch }) => {
	const updatePosition = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'position', e, editAll))
	}, [id, editAll])

	return (
		<DetailsWrapper
			summary="Position"
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ position })),
				() => dispatch(applySettingsToAll(id, { position }))
			])}>
			<Slider
				label="X"
				name="x"
				value={position.x}
				min={-100}
				max={100}
				points={[0]}
				onChange={updatePosition} />
			<Slider
				label="Y"
				name="y"
				value={position.y}
				min={-100}
				max={100}
				points={[0]}
				onChange={updatePosition} />
		</DetailsWrapper>
	)
}, compareProps)

Position.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	position: exact({
		x: oneOfType([oneOf(['']), number]),
		y: oneOfType([oneOf(['']), number])
	}).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Position
