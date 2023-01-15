import React, { useCallback, useEffect, useState } from 'react'
import { arrayOf, bool, exact, func, number, object, oneOf, string } from 'prop-types'

import Preview from './preview/Preview'
import EditorOptions from './editor/EditorOptions'

const eyeDropperInit = { active: false, pixelData: false }

const PreviewEditorContainer = props => {
	const [ eyedropper, setEyedropper ] = useState(eyeDropperInit)
	const { selected, dispatch } = props

	const resetEyedropperOnEscape = useCallback(e => {
		if (e.key === 'Escape') setEyedropper(eyeDropperInit)
	}, [])

	useEffect(() => {
		window.addEventListener('keydown', resetEyedropperOnEscape)

		return () => {
			window.removeEventListener('keydown', resetEyedropperOnEscape)
		}
	}, [])

	return (
		<div id="editor">
			<Preview
				eyedropper={eyedropper}
				setEyedropper={setEyedropper}
				selected={selected}
				aspectRatioMarkers={props.aspectRatioMarkers}
				previewQuality={props.previewQuality}
				dispatch={dispatch} />
			<EditorOptions
				eyedropper={eyedropper}
				setEyedropper={setEyedropper}
				batch={props.batch}
				editAll={props.editAll}
				split={props.split}
				isBatch={props.isBatch}
				dispatch={dispatch}
				{...selected} />
		</div>
	)
}

PreviewEditorContainer.propTypes = {
	selected: object.isRequired,
	previewQuality: oneOf([1, 0.75, 0.5]),
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	editAll: bool.isRequired,
	batch: object.isRequired,
	split: number,
	isBatch: bool.isRequired,
	dispatch: func.isRequired
}

export default PreviewEditorContainer
