import React, { useMemo } from 'react'

import PreviewContainer from './preview/PreviewContainer'
import EditorOptions from './editor/EditorOptions'

const PreviewEditorContainer = ({ selected, editAll, batch, split, isBatch, dispatch }) => {
	const { arc, overlay, hasAlpha } = selected

	const backgroundDisabled = useMemo(() => (
		arc === 'none' || arc === 'fill' && !hasAlpha && overlay === 'none'
	), [arc, overlay, hasAlpha])

	return (
		<div id="editor">
			<PreviewContainer
				selected={selected}
				editAll={editAll}
				backgroundDisabled={backgroundDisabled}
				dispatch={dispatch} />
			<EditorOptions
				batch={batch}
				editAll={editAll}
				split={split}
				isBatch={isBatch}
				backgroundDisabled={backgroundDisabled}
				dispatch={dispatch}
				{...selected} />
		</div>
	)
}

export default PreviewEditorContainer
