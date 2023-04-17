import React, { useCallback, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	updateMediaState
} from 'actions'

import { createSettingsMenu, pipe } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const commonStatic = {
	name: 'centering',
	title: 'Position',
	min: -100
}

const Centering = ({ id, centering, editAll, dispatch }) => {
	const updateCentering = useCallback(({ name, value }) => {
		dispatch(updateMediaState(id, {
			[name]: value
		}, editAll))
	}, [id, editAll])

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

const CenteringPanel = props => {
	const { isBatch, centering, id, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => pipe({ centering })(copySettings, dispatch),
		() => pipe({ centering })(applySettingsToAll(id), dispatch)
	]), [isBatch, id, centering])

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
}

const propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	centering: oneOfType([oneOf(['']), number]).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

Centering.propTypes = propTypes
CenteringPanel.propTypes = propTypes

export default CenteringPanel
