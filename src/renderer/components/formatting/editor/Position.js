import React, { useCallback, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	updateMediaStateBySelection
} from 'actions'

import { createSettingsMenu, pipe } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const propsXStatic = { name: 'positionX', title: 'Position X', min: -100 }
const propsYStatic = { name: 'positionY', title: 'Position Y', min: -100 }

const Position = ({ positionX, positionY, dispatch }) => {
	const updatePosition = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({ [name]: value }))
	}, [])

	const propsX = {
		...propsXStatic,
		onChange: updatePosition,
		value: positionX
	}

	const propsY = {
		...propsYStatic,
		onChange: updatePosition,
		value: positionY
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
	const { isBatch, id, positionX, positionY, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => pipe(copySettings, dispatch)({ positionX, positionY }),
		() => pipe(applySettingsToAll(id), dispatch)({ positionX, positionY })
	]), [isBatch, id, positionX, positionY])

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
	positionX: oneOfType([oneOf(['']), number]),
	positionY: oneOfType([oneOf(['']), number]),
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

Position.propTypes = propTypes
PositionPanel.propTypes = propTypes

export default PositionPanel
