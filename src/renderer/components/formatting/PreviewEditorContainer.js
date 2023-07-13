import React, { useCallback, useEffect, useState } from 'react'
import { arrayOf, bool, exact, func, number, object, oneOf, string } from 'prop-types'

import Preview from './preview/Preview'
import EditorOptions from './editor/EditorOptions'

const eyedropperInit = { active: false, pixelData: false }

const PreviewEditorContainer = props => {
	const [ eyedropper, setEyedropper ] = useState(eyedropperInit)
	const { focused, dispatch } = props

	const resetEyedropperOnEscape = useCallback(e => {
		if (e.key === 'Escape') setEyedropper(eyedropperInit)
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
				focused={focused}
				aspectRatioMarkers={props.aspectRatioMarkers}
				previewQuality={props.previewQuality}
				previewHeight={props.previewHeight}
				dispatch={dispatch} />
			<EditorOptions
				eyedropper={eyedropper}
				setEyedropper={setEyedropper}
				split={props.split}
				multipleItems={props.multipleItems}
				dispatch={dispatch}
				{...focused} />
		</div>
	)
}

PreviewEditorContainer.propTypes = {
	focused: object.isRequired,
	previewQuality: oneOf([1, 0.75, 0.5]).isRequired,
	previewHeight: number.isRequired,
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	split: number,
	multipleItems: bool.isRequired,
	dispatch: func.isRequired
}

export default PreviewEditorContainer
