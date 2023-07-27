import React, { memo, useCallback } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	updateMediaStateBySelection
} from 'actions'

import {
	createSettingsMenu,
	objectsAreEqual,
	pipe
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const commonStatic = {
	name: 'centering',
	title: 'Position',
	min: -100
}

const Centering = memo(({ centering, dispatch }) => {
	const updateCentering = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

	const common = {
		...commonStatic,
		value: centering,
		onChange: updateCentering
	}

	return (
		<>
			<SliderSingle snapPoints={[0]} {...common} />
			<NumberInput {...common} />
		</>
	)
}, objectsAreEqual)

const CenteringPanel = props => {
	const { centering, id, copyToClipboard, dispatch } = props
	const centeringProps = { centering }

	const settingsMenu = createSettingsMenu(props, [
		() => copyToClipboard(centeringProps),
		() => pipe(applySettingsToSelection(id), dispatch)(centeringProps),
		() => pipe(applySettingsToAll(id), dispatch)(centeringProps)
	])

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
	centering: oneOfType([oneOf(['']), number]).isRequired,
	copyToClipboard: func.isRequired,
	dispatch: func.isRequired
}

Centering.propTypes = propTypes
CenteringPanel.propTypes = propTypes

export default CenteringPanel
