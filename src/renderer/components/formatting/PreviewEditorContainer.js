import React, { useCallback, useEffect, useState } from 'react'
import { bool, func, number, object } from 'prop-types'

import Preview from './preview/Preview'
import EditorOptions from './editor/EditorOptions'

const eyedropperInit = { active: false, pixelData: false }

const PreviewEditorContainer = ({
	focused,
	split,
	multipleItems,
	multipleItemsSelected,
	allItemsSelected,
	dispatch
}) => {
	const [ eyedropper, setEyedropper ] = useState(eyedropperInit)

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
				dispatch={dispatch} />
			<EditorOptions
				eyedropper={eyedropper}
				setEyedropper={setEyedropper}
				split={split}
				multipleItems={multipleItems}
				multipleItemsSelected={multipleItemsSelected}
				allItemsSelected={allItemsSelected}
				dispatch={dispatch}
				{...focused} />
		</div>
	)
}

PreviewEditorContainer.propTypes = {
	focused: object.isRequired,
	split: number,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	allItemsSelected: bool.isRequired,
	clipboard: object,
	dispatch: func.isRequired
}

export default PreviewEditorContainer
