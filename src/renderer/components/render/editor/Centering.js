import React, { memo } from 'react'
import { bool, func, number, string } from 'prop-types'

import { updateMediaStateFromEvent } from '../../../actions'
import { copySettings, applySettingsToAll } from '../../../actions/render'
import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Slider from '../../form_elements/Slider'

const Centering = memo(({ id, onlyItem, centering, editAll, dispatch }) => (
	<DetailsWrapper
		summary="Position"
		buttons={onlyItem && createSettingsMenu([
			() => dispatch(copySettings({ centering })),
			() => dispatch(applySettingsToAll(id, { centering }))
		])}
		open>
		<Slider
			label="Centering"
			hideLabel
			name="centering"
			min={-100}
			max={100}
			value={centering}
			points={[0]}
			onChange={e => dispatch(updateMediaStateFromEvent(id, e, editAll))}
			data-number />
	</DetailsWrapper>
), compareProps)

Centering.propTypes = {
	id: string.isRequired,
	onlyItem: bool.isRequired,
	centering: number.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Centering
