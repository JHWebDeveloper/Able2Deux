import React, { useCallback, useContext, useId, useMemo, useRef } from 'react'
import { arrayOf, bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { PrefsContext } from 'store'
import { classNameBuilder } from 'utilities'

import SliderThumb from './SliderThumb'
import SliderSnapMarkers from './SliderSnapMarkers'

const SingleSlider = ({
	name,
	title,
	alignment = 'center',
	value = 0,
	min = 0,
	max = 100,
	step = 1,
	microStep = 0.1,
	macroStep = 10,
	snapPoints = [],
	sensitivity = 4,
	disabled = false,
	onChange = () => {},
	onClick,
	onDoubleClick,
	transformValueForAria = val => val
}) => {
	const { sliderSnapPoints } = useContext(PrefsContext).preferences

	const thumbRef = useRef(null)
	const trackRef = useRef(null)
	
	const sliderId = useId()
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
			className={classNameBuilder({
				slider: true,
				disabled
			})}
			title={title}
			aria-label={title}>
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
					microStep={microStep}
					macroStep={macroStep}
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
	microStep: number,
	macroStep: number,
	snapPoints: arrayOf(number),
	sensitivity: number,
	onChange: func,
	onClick: oneOfType([oneOf([false]), func]),
	onDoubleClick: oneOfType([oneOf([false]), func]),
	disabled: bool,
	transformValueForAria: func
}

export default SingleSlider
