import React, { createRef, useCallback, useContext, useMemo, useRef } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'
import { v1 as uuid } from 'uuid'

import { PrefsContext } from 'store/preferences.js'

import SliderThumb from './SliderThumb'
import SliderSnapMarkers from './SliderSnapMarkers'

const getClickPosLeft = e => e.clientX - e.target.getBoundingClientRect().right
const getClickPosRight = e => e.clientX - e.target.getBoundingClientRect().left

const setValue = ({ name, onChange }, val) => onChange({
	name,
	value: parseFloat(val.toFixed(2))
})

const DoubleSlider = ({
	leftThumb = {
		name: '',
		title: '',
		value: 0,
		onChange() {}
	},
	rightThumb = {
		name: '',
		title: '',
		value: 100,
		onChange() {}
	},
	min = 0,
	max = 100,
	step = 1,
	fineTuneStep = 0.05,
	snapPoints = [],
	sensitivity = 4,
	sliderTitle = '',
	middleThumbTitle = '',
	onPan,
	enableAutoCenter = false,
	disabled = false
}) => {
	const { sliderSnapPoints } = useContext(PrefsContext).preferences

	const leftRef = createRef()
	const rightRef = createRef()
	const trackRef = useRef()
	
	const leftId = useMemo(uuid, [])
	const rightId = useMemo(uuid, [])
	const middleId = useMemo(uuid, [])
	const diff = useMemo(() => max - min, [min, max])
	const diffLR = useMemo(() => rightThumb.value - leftThumb.value, [leftThumb.value, rightThumb.value])
	const width = useMemo(() => diffLR / diff * 100, [diff, diffLR])

	const thresholds = useMemo(() => {
		if (sliderSnapPoints) {
			return snapPoints.map(pt => [pt, pt - sensitivity, pt + sensitivity])
		} else {
			return []
		}
	}, [sliderSnapPoints, snapPoints])

	const getTrack = useCallback(() => trackRef.current.getBoundingClientRect(), [trackRef])

	const setLeft = useCallback(val => setValue(leftThumb, val), [leftThumb.onChange])
	const setRight = useCallback(val => setValue(rightThumb, val), [rightThumb.onChange])

	const setBoth = useCallback(val => setValue({
		onChange: ({ value }) => onPan({
			valueL: value,
			valueR: value + diffLR
		})
	}, val), [onPan, diffLR])

	const jumpToPosition = useCallback(e => {
		const track = getTrack()
		const mousePos = (e.clientX - track.left) / track.width * diff + min

		if (mousePos < leftThumb.value) {
			setLeft(mousePos)
			e.target = document.getElementById(leftId)
			leftRef.current?.startDrag(e, 0)
		} else if (mousePos > rightThumb.value) {
			setRight(mousePos)
			e.target = document.getElementById(rightId)
			rightRef.current?.startDrag(e, 0)
		}
	}, [leftThumb.value, rightThumb.value, leftThumb.onChange, rightThumb.onChange, diff, min])

	const autoCenter = enableAutoCenter && useCallback(() => {
		setBoth(50 - diffLR / 2)
	}, [onPan, diffLR])

	const common = { diff, step, fineTuneStep, getTrack }

	return (
		<span
			className={`slider${disabled ? ' disabled' : ''}`}
			title={sliderTitle}>
			<span
				className="slider-track double"
				ref={trackRef}
				onMouseDown={jumpToPosition}>
				<SliderThumb
					sliderId={leftId}
					ref={leftRef}
					title={leftThumb.title}
					value={leftThumb.value}
					min={min}
					max={rightThumb.value - fineTuneStep}
					thresholds={sliderSnapPoints && thresholds}
					setValue={setLeft}
					getClickPos={getClickPosLeft}
					{...common} />
				<SliderThumb
					sliderId={middleId}
					title={middleThumbTitle}
					value={leftThumb.value}
					width={leftThumb.value <= rightThumb.value && width}
					min={min}
					max={max - diffLR}
					setValue={setBoth}
					getClickPos={getClickPosRight}
					onDoubleClick={enableAutoCenter && autoCenter}
					{...common} />
				<SliderThumb
					sliderId={rightId}
					ref={rightRef}
					title={rightThumb.title}
					value={rightThumb.value}
					min={leftThumb.value + fineTuneStep}
					max={max}
					absoluteMin={min}
					thresholds={sliderSnapPoints && thresholds}
					setValue={setRight}
					getClickPos={getClickPosRight}
					{...common} />
			</span>
			{snapPoints.length ? (
				<SliderSnapMarkers
					markers={snapPoints}
					min={min}
					diff={diff}
					id={leftId} />
			) : <></>}
		</span>
	)
}

const thumbPropType = exact({
	name: string,
	title: string,
	value: oneOfType([oneOf(['']), number]),
	onChange: func
})

DoubleSlider.propTypes = {
	leftThumb: thumbPropType,
	rightThumb: thumbPropType,
	min: number,
	max: number,
	step: number,
	fineTuneStep: number,
	snapPoints: arrayOf(number),
	sensitivity: number,
	sliderTitle: string,
	middleThumbTitle: string,
	onPan: func,
	enableAutoCenter: bool
}

export default DoubleSlider
