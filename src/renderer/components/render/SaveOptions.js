import React from 'react'

import { toggleSaveLocation } from '../../actions/render'

import Checkbox from '../form_elements/Checkbox'

const SaveOptions = ({ isBatch, saveLocations, dispatch }) => (
	<div id="save-options" style={{ gridRow: isBatch ?  3 : '2 / span 2' }}>
		<fieldset>
			<legend>Save Locations:</legend>
			{saveLocations.map(({ id, label, checked }) => (
				<Checkbox
					key={id}
					label={label}
					checked={checked}
					onChange={() => dispatch(toggleSaveLocation(id))} />
			))}
		</fieldset>
	</div>
)

export default SaveOptions
