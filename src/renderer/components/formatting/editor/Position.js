import React, { memo, useCallback, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	updateMediaNestedState,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const propsXStatic = { name: 'x', title: 'Position X', min: -100 }
const propsYStatic = { name: 'y', title: 'Position Y', min: -100 }

const Position = memo(({ id, position, editAll, dispatch }) => {
	const updatePosition = useCallback(({ name, value }) => {
		dispatch(updateMediaNestedState(id, 'position', {
			[name]: value
		}, editAll))
	}, [id, editAll])

	const propsX = {
		...propsXStatic,
		onChange: updatePosition,
		value: position.x
	}

	const propsY = {
		...propsYStatic,
		onChange: updatePosition,
		value: position.y
	}

	return (
		<>
			<label>X</label>
			<SliderSingle snapPoints={[0]} {...propsX} />
			<NumberInput {...propsX} />
			<label>Y</label>
			<SliderSingle snapPoints={[0]} {...propsY} />
			<NumberInput {...propsY} />
		</>
	)
}, compareProps)

const PositionPanel = props => {
	const { isBatch, id, position, dispatch } = props

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({ position })),
		() => dispatch(applySettingsToAll(id, { position }))
	]) : [], [isBatch, id, position])

	return (
		<AccordionPanel
			summary="Position"
			id="position"
			className="editor-panel auto-rows position-panel"
			buttons={settingsMenu}>
			<Position {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	position: exact({
		x: oneOfType([oneOf(['']), number]),
		y: oneOfType([oneOf(['']), number])
	}).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

Position.propTypes = propTypes
PositionPanel.propTypes = propTypes

export default PositionPanel
