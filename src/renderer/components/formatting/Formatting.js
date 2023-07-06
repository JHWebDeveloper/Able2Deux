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
		batch,
		editAll,
		split,
		saveLocations,
		aspectRatioMarkers,
		previewQuality,
		previewHeight,
		rendering,
		dispatch
	} = useContext(MainContext)

	if (!media.length) return <Navigate replace to="/" />

	const prevIndex = useRef(0)
	const focused = media.find(item => item.focused) || {}
	const isBatch = media.length > 1

	const setRendering = useCallback(isRendering => {
		dispatch(updateState({ rendering: isRendering }))
	}, [])

	// useEffect(() => {
	// 	if (focused.id) {
	// 		prevIndex.current = media.findIndex(item => item.id === focused.id)
	// 	} else {
	// 		dispatch(selectMedia(media[Math.min(prevIndex.current, media.length - 1)].id))
	// 	}
	// }, [focused])

	return (
		<form>
			<div id="media-manager">			
				<MediaSelector
					media={media}
					focused={focused}
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
				focused={focused}
				editAll={editAll}
				aspectRatioMarkers={aspectRatioMarkers}
				previewQuality={previewQuality}
				previewHeight={previewHeight}
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
