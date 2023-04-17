import React, { useCallback, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	updateMediaNestedState
} from 'actions'

import { createSettingsMenu, pipe } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const propsXStatic = { name: 'x', title: 'Position X', min: -100 }
const propsYStatic = { name: 'y', title: 'Position Y', min: -100 }

const Position = ({ id, position, editAll, dispatch }) => {
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
}

const PositionPanel = props => {
	const { isBatch, id, position, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => pipe(copySettings, dispatch)({ position }),
		() => pipe(applySettingsToAll(id), dispatch)({ position })
	]), [isBatch, id, position])

	return (
		<AccordionPanel
			heading="Position"
			id="position"
			className="editor-options auto-rows"
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
