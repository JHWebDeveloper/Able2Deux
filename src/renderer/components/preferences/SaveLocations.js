import React, { useEffect } from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

import { addNewLocation } from '../../actions'

import Directory from './Directory'

const SaveLocations = ({ saveLocations, dispatch }) => {
	useEffect(() => {
		if (saveLocations.length === 0) {
			dispatch(addNewLocation(0, false))
		}
	}, [saveLocations])

	return (
		<div id="save-locations">
			<fieldset>
				<legend>Save Locations</legend>
				<div>
					<label id="default">Default</label>
					<label id="label">Label</label>
					<label id="folder">Folder</label>
					{saveLocations.map((dir, i) => (
						<Directory
							key={dir.id}
							index={i}
							dispatch={dispatch}
							dir={dir} />
					))}
				</div>
			</fieldset>
		</div>
	)
}

SaveLocations.propTypes = {
	saveLocations: arrayOf(exact({
		checked: bool,
		label: string,
		directory: string,
		id: string
	})),
	dispatch: func.isRequired
}

export default SaveLocations
