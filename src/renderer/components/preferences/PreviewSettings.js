import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import { updateState, updateStateFromEvent } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import AspectRatioMarkers from './AspectRatioMarkers'

const qualityButtons = [
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
]

const PreviewSettings = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	const setPreviewQuality = useCallback(e => {
		dispatch(updateState({
			previewQuality: parseFloat(e.target.value)
		}))
	}, [])

	return (
		<form>
			<fieldset className="radio-set">
				<legend>Default Quality:</legend>
				<RadioSet
					name="previewQuality"
					buttons={qualityButtons}
					state={preferences.previewQuality.toString()}
					onChange={setPreviewQuality} />
			</fieldset>
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
