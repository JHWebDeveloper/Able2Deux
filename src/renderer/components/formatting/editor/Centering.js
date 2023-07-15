import React, { memo, useCallback } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	copySettings,
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

const Centering = ({ centering, dispatch }) => {
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
}

const CenteringPanel = memo(props => {
	const { centering, id, dispatch } = props
	const centeringProps = { centering }

	const settingsMenu = createSettingsMenu(props, [
		() => pipe(copySettings, dispatch)(centeringProps),
		() => pipe(applySettingsToSelection(id), dispatch)(centeringProps),
		() => pipe(applySettingsToAll(id), dispatch)(centeringProps)
	])

	return (
		<AccordionPanel
			heading="Position"
			id="centering"
			className="editor-options auto-rows"
			buttons={settingsMenu}
			initOpen>
			<Centering {...props} />
		</AccordionPanel>
	)
}, objectsAreEqual)

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	centering: oneOfType([oneOf(['']), number]).isRequired,
	dispatch: func.isRequired
}

Centering.propTypes = propTypes
CenteringPanel.propTypes = propTypes

export default CenteringPanel
