import React from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

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

SaveOptions.propTypes = {
	isBatch: bool.isRequired,
	saveLocations: arrayOf(exact({
		id: string,
		directory: string,
		label: string,
		checked: bool
	})).isRequired,
	dispatch: func.isRequired
}

export default SaveOptions
