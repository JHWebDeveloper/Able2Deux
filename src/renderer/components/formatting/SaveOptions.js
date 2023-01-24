import React from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

import { toggleSaveLocation } from 'actions'

import Checkbox from '../form_elements/Checkbox'

const SaveOptions = ({ isBatch, saveLocations, dispatch }) => (
	<div
		id="save-options"
		style={{ gridRow: isBatch ? 3 : '2 / span 2' }}>
		<h2>Save Locations</h2>
		<div>
			{saveLocations.map(({ id, label, hidden, checked }) => hidden ? <></> : (
				<Checkbox
					key={id}
					label={label}
					checked={checked}
					onChange={() => dispatch(toggleSaveLocation(id))} />
			))}
		</div>
	</div>
)

SaveOptions.propTypes = {
	isBatch: bool.isRequired,
	saveLocations: arrayOf(exact({
		checked: bool,
		directory: string,
		hidden: bool,
		id: string,
		label: string
	})).isRequired,
	dispatch: func.isRequired
}

export default SaveOptions
