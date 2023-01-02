import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import 'css/index/formatting.css'

import { MainContext } from 'store'
import { selectMedia, updateState } from 'actions'

import MediaSelector from './selector/MediaSelector'
import BatchName from './BatchName'
import SaveOptions from './SaveOptions'
import SaveButtons from './SaveButtons'
import PreviewEditorContainer from './PreviewEditorContainer'
import RenderQueue from './render-queue/RenderQueue'

const Formatting = () => {
	const {
		media,
		selectedId,
		batch,
		editAll,
		split,
		saveLocations,
		aspectRatioMarkers,
		previewQuality,
		rendering,
		dispatch
	} = useContext(MainContext)

	if (!media.length) return <Navigate replace to="/" />

	const prevIndex = useRef(0)
	const selected = media.find(item => item.id === selectedId) || {}
	const isBatch = media.length > 1

	const setRendering = useCallback(isRendering => {
		dispatch(updateState({ rendering: isRendering }))
	}, [])

	useEffect(() => {
		if (selected.id) {
			prevIndex.current = media.findIndex(item => item.id === selectedId)
		} else {
			dispatch(selectMedia(media[Math.min(prevIndex.current, media.length - 1)].id))
		}
	}, [selected])

	return (
		<form>
			<div id="media-manager">			
				<MediaSelector
					media={media}
					selected={selected}
					isBatch={isBatch}
					editAll={editAll}
					dispatch={dispatch} />	
				{isBatch ? (
					<BatchName
						batch={batch}
						dispatch={dispatch} />
				) : <></>}
				<SaveOptions
					isBatch={isBatch}
					saveLocations={saveLocations}
					dispatch={dispatch} />
				<SaveButtons setRendering={setRendering} />
			</div>
			<PreviewEditorContainer
				selected={selected}
				editAll={editAll}
				aspectRatioMarkers={aspectRatioMarkers}
				previewQuality={previewQuality}
				batch={batch}
				isBatch={isBatch}
				split={split}
				dispatch={dispatch} />
			{rendering ? (
				<RenderQueue
					media={media}
					batch={batch}
					saveLocations={saveLocations}
					closeRenderQueue={() => setRendering(false)}
					dispatch={dispatch} />
			) : <></>}
		</form>
	)
}

export default Formatting
