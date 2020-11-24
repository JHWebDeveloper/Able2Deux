import React, { useCallback, useMemo, useRef } from 'react'
import { arrayOf, func, number, oneOf, oneOfType, string } from 'prop-types'
import { v1 as uuid } from 'uuid'

/*TEMP*/
import 'css/index/slider.css'
/*TEMP*/

import SliderThumb from './SliderThumb'
import SliderSnapMarkers from './SliderSnapMarkers'

const SingleSlider = ({
	name,
	title,
	value = 0,
	min = 0,
	max = 100,
	step = 1,
	fineTuneStep = 0.05,
	snapPoints = [],
	sensitivity = 4,
	onChange = () => {}
}) => {
	const thumbRef = useRef()
	const trackRef = useRef()
	
	const sliderId = useMemo(uuid, [])
	const diff = useMemo(() => max - min, [max, min])
	const thresholds = useMemo(() => snapPoints.map(pt => [pt, pt - sensitivity, pt + sensitivity]), [])

	const getTrack = useCallback(() => trackRef.current.getBoundingClientRect(), [])

	const setValue = useCallback(val => onChange({
		name,
		value: parseFloat(val.toFixed(2))
	}), [onChange])

	const jumpToPosition = useCallback(e => {
		const track = getTrack()
		const mousePos = (e.clientX - track.left) / track.width * diff + min

		setValue(mousePos)
		
		e.target = document.getElementById(sliderId)

		thumbRef.current.startDrag(e, 0)
	}, [min, diff, onChange])

	return (
		<span className="slider" title={title}>
			<span
				className="slider-track single"
				ref={trackRef}
				onMouseDown={jumpToPosition}>
				<SliderThumb
					sliderId={sliderId}
					ref={thumbRef}
					title={title}
					value={value}
					diff={diff}
					min={min}
					max={max}
					step={step}
					fineTuneStep={fineTuneStep}
					thresholds={thresholds}
					setValue={setValue}
					getTrack={getTrack} />
			</span>
			{!!snapPoints.length && (
				<SliderSnapMarkers
					markers={snapPoints}
					min={min}
					diff={diff}
					id={sliderId} />
			)}
		</span>
	)
}

SingleSlider.propTypes = {
	name: string,
	value: oneOfType([oneOf(['']), number]),
	onChange: func,
	min: number,
	max: number,
	step: number,
	fineTuneStep: number,
	snapPoints: arrayOf(number),
	sensitivity: number
}

export default SingleSlider