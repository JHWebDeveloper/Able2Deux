import React, { useEffect, useRef } from 'react'
import { number, oneOf, oneOfType, string } from 'prop-types'

import { MEDIA_TYPES } from 'constants' 

import {
	capitalize,
	framesToTC,
	scrollText
} from 'utilities'

import Thumbnail from './Thumbnail'

const MediaInfo = ({
	refId,
	mediaType,
	title,
	width,
	height,
	aspectRatio,
	totalFrames,
	fps,
	channelLayout,
	sampleRate,
	bitRate
}) => {
	const h2 = useRef(null)

	useEffect(() => {
		const textAnimation = scrollText(h2.current)

		return textAnimation.disconnect
	}, [title])

	return (
		<div>
			<Thumbnail
				refId={refId}
				mediaType={mediaType}
				title={title} />
			<h2 className="overlow-ellipsis" ref={h2}>{title}</h2>
			<ul>
				{!!totalFrames && fps ? <li>{framesToTC(totalFrames, fps)}</li> : <></>}
				{!!width && !!height ? <li>{width}x{height}</li> : <></>}
				{aspectRatio ? <li>{aspectRatio}</li> : <></>}
				{fps ? <li>{fps}fps</li> : <></>}
				{channelLayout ? <li>{capitalize(channelLayout)}</li> : <></>}
				{bitRate ? <li>{bitRate}</li> : <></>}
				{sampleRate ? <li>{sampleRate}</li> : <></>}
			</ul>
		</div>
	)
}

MediaInfo.propTypes = {
	refId: string,
	mediaType: oneOf(MEDIA_TYPES),
	title: string,
	width: number,
	height: number,
	aspectRatio: string,
	totalFrames: number,
	fps: oneOfType([oneOf([false]), number]),
	channelLayout: string,
	sampleRate: string,
	bitRate: string
}

export default MediaInfo
