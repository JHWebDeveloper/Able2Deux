import React, { useContext, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import '../../css/index/render.css'

import { MainContext } from '../../store'
import { selectMedia } from '../../actions/render'

import MediaInfo from './selector/MediaInfo'
import BatchList from './selector/BatchList'
import EditAll from './selector/EditAll'
import BatchName from './BatchName'
import SaveOptions from './SaveOptions'
import SaveButtons from './SaveButtons'
import Preview from './preview/Preview'
import AudioPreview from './preview/AudioPreview'
import EditorOptions from './editor/EditorOptions'
import RenderQueue from './render-queue/RenderQueue'

const Render = () => {
	const {
		media,
		selectedId,
		batch,
		editAll,
		saveLocations,
		dispatch
	} = useContext(MainContext)

	if (!media.length) return <Redirect to="/" />

	const [ rendering, setRendering ] = useState(false)
	const selected = media.find(item => item.id === selectedId)

	useEffect(() => {
		if (!selected) dispatch(selectMedia(media[0].id))
	}, [selected])

	if (!selected) return false

	const { thumbnail, title, width, height, aspectRatio, duration, fps, mediaType } = selected || {}

	const isBatch = media.length > 1

	return (
		<form>
			<div id="media-manager">				
				<div id="media-selector">
					<MediaInfo
						thumbnail={thumbnail}
						title={title}
						width={width}
						height={height}
						aspectRatio={aspectRatio}
						duration={duration}
						fps={fps}
						dispatch={dispatch} />
					<BatchList
						media={media}
						selectedId={selectedId}
						dispatch={dispatch} />
					{isBatch && <EditAll editAll={editAll} dispatch={dispatch} />}
				</div>
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
				{mediaType === 'audio' || mediaType === 'video' && selected.audio.exportAs === 'audio'
					? <AudioPreview format={selected.audio.format}/>
					: <Preview selected={selected} dispatch={dispatch} />}
				<EditorOptions
					batch={batch}
					editAll={editAll}
					onlyItem={!isBatch}
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

export default Render
