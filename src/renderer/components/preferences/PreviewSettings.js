import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'

import { updateState, updateStateFromEvent } from 'actions'

import RadioSet from '../form_elements/RadioSet'
import AspectRatioMarkers from './AspectRatioMarkers'

const QUALITY_OPTIONS = Object.freeze([
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
				options={QUALITY_OPTIONS}
				state={preferences.previewQuality.toString()}
				onChange={setPreviewQuality} />
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
