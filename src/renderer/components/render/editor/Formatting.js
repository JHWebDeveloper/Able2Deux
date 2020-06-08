import React, { memo } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import { updateMediaStateFromEvent } from '../../../actions'
import { copySettings, applySettingsToAll } from '../../../actions/render'
import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'

const Formatting = memo(({ id, onlyItem, arc, background, overlay, mediaType, editAll, dispatch }) => (
	<DetailsWrapper
		summary="Formatting"
		className="auto-columns"
		buttons={onlyItem ? false : createSettingsMenu([
			() => dispatch(copySettings({ arc, background, overlay })),
			() => dispatch(applySettingsToAll(id, { arc, background, overlay }))
		])}
		open>
		<fieldset>
			<legend>AR Correction:</legend>
			<RadioSet
				name="arc"
				state={arc}
				onChange={e => dispatch(updateMediaStateFromEvent(id, e, editAll))}
				buttons={[
					{
						label: 'None',
						value: 'none'
					},
					{
						label: 'Fill Frame',
						value: 'fill'
					},
					{
						label: 'Fit Inside Frame',
						value: 'fit'
					},
					{
						label: 'Transform',
						value: 'transform'
					}
				]}/>
		</fieldset>
		<fieldset disabled={arc === 'none' || arc === 'fill' && overlay === 'none'}>
			<legend>Background:</legend>
			<RadioSet
				name="background"
				state={background}
				onChange={e => dispatch(updateMediaStateFromEvent(id, e, editAll))}
				buttons={[
					{
						label: 'Blue',
						value: 'blue'
					},
					{
						label: 'Grey',
						value: 'grey'
					},
					{
						label: 'Transparent',
						value: 'alpha'
					},
					{
						label: 'Black',
						value: 'black'
					}
				]}/>
		</fieldset>
		{mediaType === 'video' ? (
			<fieldset disabled={arc === 'none'}>
				<legend>Box Overlay:</legend>
				<RadioSet
					name="overlay"
					state={overlay}
					onChange={e => dispatch(updateMediaStateFromEvent(id, e, editAll))}
					buttons={[
						{
							label: 'None',
							value: 'none'
						},
						{
							label: 'TV',
							value: 'tv'
						},
						{
							label: 'Laptop',
							value: 'laptop'
						}
					]}/>
			</fieldset>
		) : <></>}
	</DetailsWrapper>
), compareProps)

Formatting.propTypes = {
	id: string.isRequired,
	onlyItem: bool.isRequired,
	arc: oneOf(['none', 'fit', 'fill', 'transform']).isRequired,
	background: oneOf(['blue', 'grey', 'alpha', 'black']).isRequired,
	overlay: oneOf(['none', 'tv', 'laptop']),
	mediaType: string.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}


export default Formatting
