import React, { useContext, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import '../../css/index/render.css'

import { MainContext } from '../../store'
import { selectMedia } from '../../actions/render'

import MediaInfo from './selector/MediaInfo'
import BatchList from './selector/BatchList'
import EditAll from './selector/EditAll'
import SaveOptions from './SaveOptions'
import Preview from './preview/Preview'
import EditorOptions from './editor/EditorOptions'

const Render = () => {
	const { media, selectedId, batchName, editAll, saveLocations, dispatch } = useContext(MainContext)

	if (!media.length) return <Redirect to="/" />

	const selected = media.find(item => item.id === selectedId)

	useEffect(() => {
		if (!selected) dispatch(selectMedia(media[0].id))
	}, [selected])

	if (!selected) return false

	const { thumbnail, title, width, height, aspectRatio, duration, fps } = selected || {}

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
					{media.length > 1 && (
						<EditAll editAll={editAll} dispatch={dispatch} />
					)}
				</div>
				<SaveOptions
					batchName={batchName}
					saveLocations={saveLocations}
					dispatch={dispatch} />
			</div>
			<div id="editor">
				<Preview
					selected={selected}
					dispatch={dispatch} />
				<EditorOptions
					batchName={batchName}
					editAll={editAll}
					onlyItem={media.length < 2}
					dispatch={dispatch}
					{...selected} />
			</div>
		</form>
	)
}

export default Render
