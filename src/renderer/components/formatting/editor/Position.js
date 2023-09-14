import React, { memo, useCallback, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset,
	updateMediaStateBySelection
} from 'actions'

import {
	createObjectPicker,
	createSettingsMenu,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const X_STATIC_PROPS = Object.freeze({ name: 'positionX', title: 'Position X', min: -100 })
const Y_STATIC_PROPS = Object.freeze({ name: 'positionY', title: 'Position Y', min: -100 })

const extractPositionProps = createObjectPicker(['positionX', 'positionY'])

const Position = memo(({ positionX, positionY, dispatch }) => {
	const updatePosition = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({ [name]: value }))
	}, [])

	const propsX = {
		...X_STATIC_PROPS,
		onChange: updatePosition,
		value: positionX
	}

	const propsY = {
		...Y_STATIC_PROPS,
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
}, objectsAreEqual)

const PositionPanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractPositionProps)),
			() => dispatch(applyToSelection(id, extractPositionProps)),
			() => dispatch(applyToAll(id, extractPositionProps)),
			() => dispatch(saveAsPreset(id, extractPositionProps))
		])
	), [multipleItems, multipleItemsSelected, id])

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
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	positionX: oneOfType([oneOf(['']), number]).isRequired,
	positionY: oneOfType([oneOf(['']), number]).isRequired,
	dispatch: func.isRequired
}

Position.propTypes = propTypes
PositionPanel.propTypes = propTypes

export default PositionPanel
