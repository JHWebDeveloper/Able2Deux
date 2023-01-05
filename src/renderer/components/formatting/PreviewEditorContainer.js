import React, { useState } from 'react'
import { arrayOf, bool, exact, func, number, object, oneOf, string } from 'prop-types'

import PreviewContainer from './preview/PreviewContainer'
import EditorOptions from './editor/EditorOptions'

const PreviewEditorContainer = ({ selected, aspectRatioMarkers, previewQuality, editAll, batch, split, isBatch, dispatch }) => {
	const [ eyedropper, setEyedropper ] = useState({ active: false, pixelData: false })

	return (
		<div id="editor">
			<PreviewContainer
				eyedropper={eyedropper}
				setEyedropper={setEyedropper}
				selected={selected}
				aspectRatioMarkers={aspectRatioMarkers}
				previewQuality={previewQuality}
				dispatch={dispatch} />
			<EditorOptions
				eyedropper={eyedropper}
				setEyedropper={setEyedropper}
				batch={batch}
				editAll={editAll}
				split={split}
				isBatch={isBatch}
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
