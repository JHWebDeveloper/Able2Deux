import React, { useEffect, useRef } from 'react'
import { number, oneOf, oneOfType, string } from 'prop-types'

import {
	capitalize,
	framesToTC,
	scrollText
} from 'utilities'

const MediaInfo = props => {
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

	const h2 = useRef(null)

	useEffect(() => {
		const textAnimation = scrollText(h2.current)

		return () => {
			textAnimation.disconnect()
		}
	}, [title])

	return (
		<div>
			<img
				src={thumbnail}
				alt={title}
				draggable="false" />
			<h2 ref={h2}>{title}</h2>
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
