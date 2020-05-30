import React, { memo } from 'react'
import { number, string } from 'prop-types'

import { compareProps, secondsToTC, zeroize } from '../../../utilities'

const MediaInfo = memo(({ thumbnail, title, width, height, aspectRatio, duration, fps }) => (
	<div>
		<img src={thumbnail} alt={title} />
		<h2 title={title}>{title}</h2>
		<ul>
			{!!duration && <li>{secondsToTC(duration)};{zeroize(Math.round(duration % 1 * fps))}</li>}
			{!!width && !!height && <li>{width}x{height}</li>}
			{!!aspectRatio &&  <li>{aspectRatio}</li>}
			{!!fps && <li>{fps}fps</li>}
		</ul>
	</div>
), compareProps)

MediaInfo.propTypes = {
	thumbnail: string.isRequired,
	title: string.isRequired,
	width: number,
	height: number,
	aspectRatio: string,
	duration: number,
	fps: number
}

export default MediaInfo
