import React, { useContext } from 'react'

import { PrefsContext } from 'store'

import { updateStateFromEvent } from 'actions'

import AspectRatioMarkers from './AspectRatioMarkers'

const PreviewSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	return (
		<>
			<label className="label-with-input">
				<span>Grid Color</span>
				<input
					type="color"
					name="gridColor"
					value={preferences.gridColor}
					onChange={e => dispatch(updateStateFromEvent(e))} />
			</label>
			<AspectRatioMarkers
				aspectRatioMarkers={preferences.aspectRatioMarkers}
				dispatch={dispatch} />
		</>
	)
}

export default PreviewSettings
