import React from 'react'
import { arrayOf, bool, func, number, object, shape, string } from 'prop-types'

import MediaInfo from './MediaInfo'
import BatchList from './BatchList'
import EditAll from './EditAll'

const MediaSelector = ({ media, selected, isBatch, editAll, dispatch }) => (
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
			selectedId={selected.id}
			dispatch={dispatch} />
		{isBatch && <EditAll editAll={editAll} dispatch={dispatch} />}
	</div>
)

MediaSelector.propTypes = {
	media: arrayOf(object).isRequired,
	selected: shape({
		id: string,
		thumbnail: string,
		title: string,
		width: number,
		height: number,
		aspectRatio: string,
		duration: number,
		fps: number,
		channelLayout: string,
		sampleRate: string,
		bitRate: string
	}).isRequired,
	isBatch: bool.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default MediaSelector
