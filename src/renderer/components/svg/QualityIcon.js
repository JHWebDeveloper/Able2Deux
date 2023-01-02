import React from 'react'
import { number } from 'prop-types'

const QualityIconPath = ({ quality }) => {
	switch (quality) {
		case 1:
			return <path d="M14.4,0H3.6C1.6,0,0,1.6,0,3.6V9c0,2,1.6,3.6,3.6,3.6h10.8c2,0,3.6-1.6,3.6-3.6V3.6C18,1.6,16.4,0,14.4,0L14.4,0z"/>
		case 2:
			return <path d="M14.4,0H3.6C1.6,0,0,1.6,0,3.6V9c0,2,1.6,3.6,3.6,3.6h10.8c2,0,3.6-1.6,3.6-3.6V3.6C18,1.6,16.4,0,14.4,0z M17.1,9c0,1.5-1.2,2.7-2.7,2.7H5.9l6.2-10.8h2.3c1.5,0,2.7,1.2,2.7,2.7V9z"/>
		case 4:
			return <path d="M14.4,0.9c1.5,0,2.7,1.2,2.7,2.7V9c0,1.5-1.2,2.7-2.7,2.7H3.6c-1.5,0-2.7-1.2-2.7-2.7V3.6c0-1.5,1.2-2.7,2.7-2.7L14.4,0.9M14.4,0H3.6C1.6,0,0,1.6,0,3.6V9c0,2,1.6,3.6,3.6,3.6h10.8c2,0,3.6-1.6,3.6-3.6V3.6C18,1.6,16.4,0,14.4,0L14.4,0z"/>
		default:
			return <></>
	}
}

const QualityIcon = ({ quality }) => (
	<svg fill="currentColor" viewBox="0 -2.7 18 18">
		<QualityIconPath quality={quality} />
	</svg>
)

QualityIconPath.propTypes = { quality: number.isRequired }
QualityIcon.propTypes = { quality: number.isRequired }

export default QualityIcon
