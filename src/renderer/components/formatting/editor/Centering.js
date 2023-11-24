import React, { memo, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset
} from 'actions'

import {
	createObjectPicker,
	createSettingsMenu,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const COMMON_STATIC_PROPS = Object.freeze({
	name: 'centering',
	title: 'Centering',
	min: -100
})

const extractCenteringProps = createObjectPicker(['centering'])

const Centering = memo(({ centering, updateSelectionFromEvent }) => {
	const commonProps = {
		...COMMON_STATIC_PROPS,
		value: centering,
		onChange: updateSelectionFromEvent
	}

	return (
		<>
			<SliderSingle snapPoints={[0]} {...commonProps} />
			<NumberInput {...commonProps} />
		</>
	)
}, objectsAreEqual)

const CenteringPanel = ({ id, multipleItems, multipleItemsSelected, dispatch, ...rest }) => {
	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractCenteringProps)),
			() => dispatch(applyToSelection(id, extractCenteringProps)),
			() => dispatch(applyToAll(id, extractCenteringProps)),
			() => dispatch(saveAsPreset(id, extractCenteringProps))
		])
	), [multipleItems, multipleItemsSelected, id])

	return (
		<AccordionPanel
			heading="Centering"
			id="centering"
			className="editor-options auto-rows"
			options={settingsMenu}
			initOpen>
			<Centering {...rest} />
		</AccordionPanel>
	)
}

const sharedPropTypes = {
	centering: oneOfType([oneOf(['']), number]).isRequired,
	updateSelectionFromEvent: func.isRequired,
}

CenteringPanel.propTypes = {
	...sharedPropTypes,
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	dispatch: func.isRequired
}

Centering.propTypes = sharedPropTypes

export default CenteringPanel
