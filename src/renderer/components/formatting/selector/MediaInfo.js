import React, { memo, useEffect, useRef } from 'react'
import { number, string } from 'prop-types'

import {
	compareProps,
	secondsToTC,
	scrollText,
	zeroizeAuto,
	capitalize
} from 'utilities'

const MediaInfo = memo(props => {
	const {
		thumbnail,
		title,
		width,
		height,
		aspectRatio,
		duration,
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
				{!!duration && <li>{secondsToTC(duration)};{zeroizeAuto(Math.round(duration % 1 * fps), fps)}</li>}
				{!!width && !!height && <li>{width}x{height}</li>}
				{!!aspectRatio && <li>{aspectRatio}</li>}
				{!!fps && <li>{fps}fps</li>}
				{!!channelLayout && <li>{capitalize(channelLayout)}</li>}
				{!!bitRate && <li>{bitRate}</li>}
				{!!sampleRate && <li>{sampleRate}</li>}
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
	duration: number,
	fps: number,
	channelLayout: string,
	sampleRate: string,
	bitRate: string
}

export default MediaInfo
