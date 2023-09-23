import React from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

import { toggleSaveLocation } from 'actions'

import CheckboxSet from '../form_elements/CheckboxSet'

const SaveOptions = ({ multipleItems, saveLocations, dispatch }) => (
	<div
		id="save-options"
		className="formatting-panel"
		style={{ gridRow: multipleItems ? 3 : '2 / span 2' }}>
		<h2>Save Locations</h2>
		<CheckboxSet
			label="Select Folder"
			hideLabel
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
