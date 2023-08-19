import React from 'react'
import { arrayOf, bool, func, shape, string } from 'prop-types'

import MediaOptionButtons from '../../form_elements/MediaOptionButtons.js'

const MediaSelectorOptions = ({ allItemsSelected, dropdown }) => (
	<div>
		<MediaOptionButtons buttons={dropdown} />
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
