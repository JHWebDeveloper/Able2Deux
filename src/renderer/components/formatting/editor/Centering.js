import React, { memo, useCallback } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	updateMediaState,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const commonStatic = {
	name: 'centering',
	title: 'Position',
	min: -100
}

const Centering = memo(({ id, isBatch, centering, editAll, dispatch }) => {
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
		<DetailsWrapper
			summary="Position"
			className="editor-panel auto-rows position-panel"
			buttons={isBatch ? createSettingsMenu([
				() => dispatch(copySettings({ centering })),
				() => dispatch(applySettingsToAll(id, { centering }))
			]) : []}
			initOpen>
			<SliderSingle snapPoints={[0]} {...common} />
			<NumberInput {...common} />
		</DetailsWrapper>
	)
}, compareProps)

Centering.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	centering: oneOfType([oneOf(['']), number]).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Centering
