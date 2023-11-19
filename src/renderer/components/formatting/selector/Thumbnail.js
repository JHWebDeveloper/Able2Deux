import React, { useEffect, useState } from 'react'
import { oneOf, string } from 'prop-types'

import { MEDIA_TYPES } from 'constants'

const { interop } = window.ABLE2

const Thumbnail = ({ mediaType, refId, title }) => {
	const [ thumbnail, setThumbnail ] = useState(null)

	useEffect(() => {
		(async () => {
			setThumbnail(await interop.requestThumbnail(mediaType !== 'audio' && refId))
		})()
	}, [refId])

	return (
		<img
			src={thumbnail}
			alt={title}
			decoding="async"
			draggable="false" />
	)
}

Thumbnail.propTypes = {
	mediaType: oneOf(MEDIA_TYPES),
	refId: string,
	title: string
}

export default Thumbnail
