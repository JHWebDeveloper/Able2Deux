import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import { updateState, updateStateFromEvent } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import AspectRatioMarkers from './AspectRatioMarkers'

const QUALITY_BUTTONS = Object.freeze([
	{
		label: '100%',
		value: '1'
	},
	{
		label: '75%',
		value: '0.75'
	},
	{
		label: '50%',
		value: '0.5'
	}
])

const PreviewSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	const setPreviewQuality = useCallback(e => {
		dispatch(updateState({
			previewQuality: parseFloat(e.target.value)
		}))
	}, [])

	return (
		<>
			<RadioSet
				label="Default Quality"
				name="previewQuality"
				buttons={QUALITY_BUTTONS}
				state={preferences.previewQuality.toString()}
				onChange={setPreviewQuality} />
			<span className="input-option" style={{ alignItems: 'center' }}>
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
		</>
	)
}

export default PreviewSettings
