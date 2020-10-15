import React, { useCallback, useEffect } from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

import { addNewLocation, moveLocation } from 'actions'

import DraggableList from '../form_elements/DraggableList'
import Directory from './Directory'

const SaveLocations = ({ saveLocations, dispatch }) => {
	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveLocation(oldPos, newPos))
	}, [])

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
					<DraggableList sortingAction={sortingAction}>
						{saveLocations.map((dir, i) => (
							<Directory
								key={dir.id}
								index={i}
								total={saveLocations.length}
								dispatch={dispatch}
								dir={dir} />
						))}
					</DraggableList>
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
