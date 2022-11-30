import React, { memo, useEffect, useRef } from 'react'
import { number, oneOf, oneOfType, string } from 'prop-types'

import {
	compareProps,
	framesToTC,
	scrollText,
	capitalize
} from 'utilities'

const MediaInfo = memo(props => {
	const {
		thumbnail,
		title,
		width,
		height,
		aspectRatio,
		totalFrames,
		fps,
		channelLayout,
		sampleRate,
		bitRate
	} = props

	const ref = useRef()

	useEffect(() => {
		scrollText(ref.current)
	}, [])

	return (
		<div>
			<img src={thumbnail} alt={title} />
			<h2 ref={ref}>{title}</h2>
			<ul>
				{!!totalFrames && fps ? <li>{framesToTC(totalFrames, fps)}</li> : <></>}
				{!!width && !!height ? <li>{width}x{height}</li> : <></>}
				{!!aspectRatio ? <li>{aspectRatio}</li> : <></>}
				{!!fps ? <li>{fps}fps</li> : <></>}
				{!!channelLayout ? <li>{capitalize(channelLayout)}</li> : <></>}
				{!!bitRate ? <li>{bitRate}</li> : <></>}
				{!!sampleRate ? <li>{sampleRate}</li> : <></>}
			</ul>
		</div>
	)
}, compareProps)

MediaInfo.propTypes = {
	thumbnail: string,
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
