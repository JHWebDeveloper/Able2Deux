import React, { memo } from 'react'
import { number, string } from 'prop-types'

import { compareProps, secondsToTC, zeroize } from '../../../utilities'

let interval = false

const scrollText = e => {
	e.persist()

	requestAnimationFrame(() => { // sync to framerate
		interval = setInterval(() => {
			if (e.target.scrollWidth <= e.target.clientWidth) {
				return clearInterval(interval)
			}
	
			e.target.innerText = e.target.innerText.slice(1)
		}, 1000 / 6) // run every 10 frames
	})
}

const resetText = e => {
	clearInterval(interval)
	e.target.innerText = e.target.dataset.title
}

const MediaInfo = memo(({ thumbnail, title, width, height, aspectRatio, duration, fps }) => (
	<div>
		<img src={thumbnail} alt={title} />
		<h2
			data-title={title}
			onMouseEnter={e => scrollText(e)}
			onMouseLeave={e => resetText(e)}>{title}</h2>
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
