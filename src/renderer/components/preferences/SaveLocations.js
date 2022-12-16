import React, { useCallback, useContext, useEffect } from 'react'

import { PrefsContext } from 'store/preferences'

import { addNewLocation, moveSortableElement } from 'actions'

import DraggableList from '../form_elements/DraggableList'
import Directory from './Directory'

const SaveLocations = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { saveLocations } = preferences

	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('saveLocations', oldPos, newPos))
	}, [])

	useEffect(() => {
		if (saveLocations.length === 0) {
			dispatch(addNewLocation(0, false))
		}
	}, [saveLocations])

	return (
		<form>
			<fieldset>
				<legend>Save Locations</legend>
				<div className="save-locations-grid">
					<label id="save-locations-default">Default</label>
					<label id="save-locations-label">Label</label>
					<label id="save-locations-folder">Folder</label>
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
		</form>
	)
}

export default SaveLocations
