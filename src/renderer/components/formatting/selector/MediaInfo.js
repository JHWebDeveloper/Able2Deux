import React, { memo, useCallback, useEffect, useRef } from 'react'
import { number, string } from 'prop-types'

import {
	compareProps,
	secondsToTC,
	zeroizeAuto,
	capitalize,
	createAnimator
} from 'utilities'

const textReveal = createAnimator()

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

	const panTitle = useCallback(pause => {
		if (ref.current.scrollWidth === ref.current.clientWidth) {
			ref.current.style.textOverflow = 'clip'
			pause()
		} else {
			ref.current.innerText = ref.current.innerText.slice(1)
		}
	}, [])

	const resetPanTitle = useCallback(() => {
		ref.current.innerText = ref.current.dataset.title
		ref.current.style.removeProperty('text-overflow')
	}, [])

	useEffect(() => {
		textReveal
			.onFrame(panTitle, 10)
			.onStop(resetPanTitle)
	}, [])

	return (
		<div>
			<img src={thumbnail} alt={title} />
			<h2
				data-title={title}
				ref={ref}
				onMouseEnter={textReveal.start}
				onMouseLeave={textReveal.stop}>{title}</h2>
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
	thumbnail: string.isRequired,
	title: string.isRequired,
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
