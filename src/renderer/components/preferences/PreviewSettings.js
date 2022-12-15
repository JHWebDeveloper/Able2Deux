import React, { useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import { updateStateFromEvent } from 'actions'

import AspectRatioMarkers from './AspectRatioMarkers'

const PreviewSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	return (
		<form>
			<span className="input-option">
				<label htmlFor="grid-color">Grid Color</label>
				<input
					type="color"
					name="gridColor"
					id="grid-color"
					value={preferences.gridColor}
					onChange={e => dispatch(updateStateFromEvent(e))} />
			</span>
			<AspectRatioMarkers
				aspectRatioMarkers={preferences.aspectRatioMarkers}
				dispatch={dispatch} />
		</form>
	)
}

export default PreviewSettings
