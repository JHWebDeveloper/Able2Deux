import React, { useEffect, useRef, useState } from 'react'
import { number, oneOf, oneOfType, string } from 'prop-types'

import {
	capitalize,
	framesToTC,
	scrollText
} from 'utilities'

const { interop } = window.ABLE2

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
	const [ thumbnail, setThumbnail ] = useState()
	const h2 = useRef(null)

	useEffect(() => {
		(async () => {
			setThumbnail(await interop.requestThumbnail(mediaType === 'audio' ? false : refId))
		})()
	}, [refId])

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
