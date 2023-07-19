import React from 'react'
import { arrayOf, bool, func, oneOf, shape, string } from 'prop-types'

import DropdownMenu from '../../form_elements/DropdownMenu.js'
import MediaOptionButtons from '../../form_elements/MediaOptionButtons'

const MediaSelectorOptions = ({ allItemsSelected, dropdown }) => (
	<div>
		<DropdownMenu>
			<MediaOptionButtons buttons={dropdown} />
		</DropdownMenu>
		{allItemsSelected ? (
			<button
				type="button"
				name="deselectAll"
				className="app-button"
				onClick={dropdown[1].action}>Deselect All</button>
		) : (
			<button
				type="button"
				name="selectAll"
				className="app-button"
				onClick={dropdown[0].action}>Select All</button>
		)}
	</div>
)

MediaSelectorOptions.propTypes = {
	allItemsSelected: bool.isRequired,
	dropdown: arrayOf(shape({
		type: string,
		label: string,
		hide: bool,
		shortcut: string,
		action: func
	})).isRequired
}

export default MediaSelectorOptions
