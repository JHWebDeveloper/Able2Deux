import React from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import MediaInfo from './MediaInfo'
import BatchList from './BatchList'
import EditAll from './EditAll'

const MediaSelector = ({ media, focused, isBatch, editAll, dispatch }) => (
	<div
		id="media-selector"
		className="formatting-panel">
		<MediaInfo
			thumbnail={focused.thumbnail}
			title={focused.title}
			width={focused.originalWidth}
			height={focused.originalHeight}
			aspectRatio={focused.originalAspectRatio}
			totalFrames={focused.totalFrames}
			fps={focused.mediaType === 'video' && focused.fps}
			channelLayout={focused.channelLayout}
			sampleRate={focused.sampleRate}
			bitRate={focused.bitRate}
			dispatch={dispatch} />
		<BatchList
			media={media}
			dispatch={dispatch} />
		{isBatch ? <EditAll editAll={editAll} dispatch={dispatch} /> : <></>}
	</div>
)

MediaSelector.propTypes = {
	media: arrayOf(object).isRequired,
	focused: object.isRequired,
	isBatch: bool.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default MediaSelector
