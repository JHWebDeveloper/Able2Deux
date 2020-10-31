import React, { useContext, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import 'css/index/formatting.css'

import { MainContext } from 'store'
import { selectMedia } from 'actions'

import MediaSelector from './selector/MediaSelector'
import BatchName from './BatchName'
import SaveOptions from './SaveOptions'
import SaveButtons from './SaveButtons'
import Preview from './preview/Preview'
import EditorOptions from './editor/EditorOptions'
import RenderQueue from './render-queue/RenderQueue'

let prevIndex = 0

const Formatting = () => {
	const {
		media,
		selectedId,
		batch,
		editAll,
		saveLocations,
		dispatch
	} = useContext(MainContext)

	const { length } = media

	if (!length) return <Redirect to="/" />

	const [ rendering, setRendering ] = useState(false)
	
	const selected = media.find(item => item.id === selectedId) || {}

	useEffect(() => {
		if (selected.id) {
			prevIndex = media.findIndex(item => item.id === selectedId)
		} else {
			dispatch(selectMedia(media[Math.min(prevIndex, length - 1)].id))
		}
	}, [selected])

	const isBatch = length > 1

	return (
		<form>
			<div id="media-manager">			
				<MediaSelector
					media={media}
					selected={selected}
					isBatch={isBatch}
					editAll={editAll}
					dispatch={dispatch} />	
				{isBatch && (
					<BatchName
						batch={batch}
						dispatch={dispatch} />
				)}
				<SaveOptions
					isBatch={isBatch}
					saveLocations={saveLocations}
					dispatch={dispatch} />
				<SaveButtons setRendering={setRendering} />
			</div>
			<div id="editor">
				<Preview
					selected={selected}
					dispatch={dispatch} />
				<EditorOptions
					batch={batch}
					editAll={editAll}
					isBatch={isBatch}
					dispatch={dispatch}
					{...selected} />
			</div>
			{rendering && (
				<RenderQueue
					media={media}
					batch={batch}
					saveLocations={saveLocations}
					closeRenderQueue={() => setRendering(false)}
					dispatch={dispatch} />
			)}
		</form>
	)
}

export default Formatting
