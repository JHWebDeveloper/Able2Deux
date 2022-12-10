import React, { useCallback, useEffect } from 'react'

import { addNewLocation, moveSortableElement } from 'actions'

import DraggableList from '../form_elements/DraggableList'
import Directory from './Directory'

const SaveLocations = ({ saveLocations, dispatch }) => {	
	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('saveLocations', oldPos, newPos))
	}, [])

	useEffect(() => {
		if (saveLocations.length === 0) {
			dispatch(addNewLocation(0, false))
		}
	}, [saveLocations])

	return (
		<fieldset>
			<legend>Save Locations</legend>
			<div class="save-locations-grid">
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
	)
}

export default SaveLocations
