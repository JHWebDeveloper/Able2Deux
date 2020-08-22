import React, { useContext, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import '../../css/index/render.css'

import { MainContext } from '../../store'
import { selectMedia } from '../../actions'

import MediaInfo from './selector/MediaInfo'
import BatchList from './selector/BatchList'
import EditAll from './selector/EditAll'
import BatchName from './BatchName'
import SaveOptions from './SaveOptions'
import SaveButtons from './SaveButtons'
import Preview from './preview/Preview'
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

	const isBatch = media.length > 1

	return (
		<form>
			<div id="media-manager">				
				<div id="media-selector">
					<MediaInfo
						thumbnail={selected.thumbnail}
						title={selected.title}
						width={selected.width}
						height={selected.height}
						aspectRatio={selected.aspectRatio}
						duration={selected.duration}
						fps={selected.fps}
						channelLayout={selected.channelLayout}
						sampleRate={selected.sampleRate}
						bitRate={selected.bitRate}
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

export default Render
