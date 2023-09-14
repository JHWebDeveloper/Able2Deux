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

const COMMON_STATIC_PROPS = Object.freeze({
	name: 'centering',
	title: 'Centering',
	min: -100
})

const extractCenteringProps = createObjectPicker(['centering'])

const Centering = memo(({ centering, dispatch }) => {
	const updateCentering = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

	const commonProps = {
		...COMMON_STATIC_PROPS,
		value: centering,
		onChange: updateCentering
	}

	return (
		<>
			<SliderSingle snapPoints={[0]} {...commonProps} />
			<NumberInput {...commonProps} />
		</>
	)
}, objectsAreEqual)

const CenteringPanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

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
			buttons={settingsMenu}
			initOpen>
			<Centering {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	centering: oneOfType([oneOf(['']), number]).isRequired,
	dispatch: func.isRequired
}

Centering.propTypes = propTypes
CenteringPanel.propTypes = propTypes

export default CenteringPanel
