import React from 'react'

import Directory from './Directory'

const SaveLocations = ({ saveLocations, dispatch }) => {

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

export default SaveLocations
