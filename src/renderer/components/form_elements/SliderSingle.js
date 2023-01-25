import React, { useCallback, useContext, useMemo, useRef } from 'react'
import { arrayOf, bool, func, number, oneOf, oneOfType, string } from 'prop-types'
import { v1 as uuid } from 'uuid'

import { PrefsContext } from 'store/preferences.js'

import SliderThumb from './SliderThumb'
import SliderSnapMarkers from './SliderSnapMarkers'

const SingleSlider = ({
	name,
	title,
	alignment,
	value = 0,
	min = 0,
	max = 100,
	step = 1,
	fineTuneStep = 0.1,
	snapPoints = [],
	sensitivity = 4,
	disabled = false,
	onChange = () => {},
	onClick,
	onDoubleClick,
	transformValueForAria = val => val
}) => {
	const { sliderSnapPoints } = useContext(PrefsContext).preferences

	const thumbRef = useRef()
	const trackRef = useRef()
	
	const sliderId = useMemo(uuid, [])
	const diff = useMemo(() => max - min, [max, min])
	
	const thresholds = useMemo(() => {
		if (sliderSnapPoints) {
			return snapPoints.map(pt => [pt, pt - sensitivity, pt + sensitivity])
		} else {
			return []
		}
	}, [sliderSnapPoints, snapPoints])

	const ariaVal = useMemo(() => transformValueForAria(value), [value])
	const ariaMin = useMemo(() => transformValueForAria(min), [min])
	const ariaMax = useMemo(() => transformValueForAria(max), [max])

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

		thumbRef.current?.startDrag(e, 0)
	}, [min, diff, onChange])

	return (
		<span
			className={`slider${disabled ? ' disabled' : ''}`}
			title={title}>
			<span
				className="slider-track single"
				ref={trackRef}
				onMouseDown={jumpToPosition}>
				<SliderThumb
					sliderId={sliderId}
					ref={thumbRef}
					title={title}
					alignment={alignment}
					value={value}
					diff={diff}
					min={min}
					max={max}
					step={step}
					fineTuneStep={fineTuneStep}
					thresholds={thresholds}
					setValue={setValue}
					getTrack={getTrack}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
					ariaVal={ariaVal}
					ariaMin={ariaMin}
					ariaMax={ariaMax} />
			</span>
			{snapPoints.length ? (
				<SliderSnapMarkers
					markers={snapPoints}
					min={min}
					diff={diff}
					id={sliderId} />
			) : <></>}
		</span>
	)
}

SingleSlider.propTypes = {
	name: string,
	title: string,
	alignment: oneOf(['left', 'center', 'right']),
	value: oneOfType([oneOf(['']), number]),
	min: number,
	max: number,
	step: number,
	fineTuneStep: number,
	snapPoints: arrayOf(number),
	sensitivity: number,
	onChange: func,
	onClick: oneOfType([oneOf([false]), func]),
	onDoubleClick: oneOfType([oneOf([false]), func]),
	disabled: bool,
	transformValueForAria: func
}

export default SingleSlider
