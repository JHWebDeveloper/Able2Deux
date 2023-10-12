import React from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

import { toggleSaveLocation } from 'actions'

import CheckboxSet from '../form_elements/CheckboxSet'

const SaveOptions = ({ multipleItems, saveLocations, dispatch }) => (
	<div
		id="save-options"
		className="panel"
		style={{ gridRow: multipleItems ? 3 : '2 / span 2' }}>
		<CheckboxSet
			label="Save Locations"
			checkboxes={saveLocations.map(({ id, label, hidden, checked }) => ({
				label,
				hidden,
				checked,
				onChange() {
					dispatch(toggleSaveLocation(id))
				}
			}))} />
	</div>
)

SaveOptions.propTypes = {
	multipleItems: bool.isRequired,
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
