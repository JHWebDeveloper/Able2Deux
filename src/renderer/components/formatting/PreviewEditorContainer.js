import React, { useMemo } from 'react'
import { bool, func, number, object } from 'prop-types'

import PreviewContainer from './preview/PreviewContainer'
import EditorOptions from './editor/EditorOptions'

const PreviewEditorContainer = ({ selected, editAll, batch, split, isBatch, dispatch }) => {
	const { arc, overlay, hasAlpha } = selected

	const backgroundDisabled = useMemo(() => ( // eslint-disable-line no-extra-parens
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

PreviewEditorContainer.propTypes = {
	selected: object.isRequired,
	editAll: bool.isRequired,
	batch: object.isRequired,
	split: number,
	isBatch: bool.isRequired,
	dispatch: func.isRequired
}

export default PreviewEditorContainer
