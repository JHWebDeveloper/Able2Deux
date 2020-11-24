import React, { memo } from 'react'
import { arrayOf, number, string } from 'prop-types'

const SliderSnapMarkers = memo(({ markers, min, diff, id }) => (
	<span className="snap-markers">
		{markers.map((mark, i) => (
			<span key={`${id}_pt${i}`} style={{
				left: `${(mark - min) / diff * 100}%`
			}}></span>
		))}
	</span>
))

SliderSnapMarkers.propTypes = {
	markers: arrayOf(number),
	min: number,
	diff: number,
	id: string
}

export default SliderSnapMarkers
