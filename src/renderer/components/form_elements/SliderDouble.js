import React, { createRef, useCallback, useContext, useMemo, useRef } from 'react'
import { arrayOf, bool, func, number, oneOf, oneOfType, shape, string } from 'prop-types'
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

const SliderDouble = ({
	leftThumb = {
		name: '',
		title: '',
		value: 0,
		max,
		onChange() {},
		onClick: false,
		onDoubleClick: false
	},
	rightThumb = {
		name: '',
		title: '',
		value: 100,
		min,
		onChange() {},
		onClick: false,
		onDoubleClick: false
	},
	min = 0,
	max = 100,
	step = 1,
	fineTuneStep = 0.05,
	snapPoints = [],
	sensitivity = 4,
	sliderTitle = '',
	middleThumbTitle = '',
	onPan = () => {},
	enableAutoCenter = false,
	disabled = false,
	transformValueForAria = val => val
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

	const leftAriaVal = useMemo(() => transformValueForAria(leftThumb.value), [leftThumb.value])
	const rightAriaVal = useMemo(() => transformValueForAria(rightThumb.value), [rightThumb.value])
	const leftAriaMin = useMemo(() => transformValueForAria(min), [min])
	const leftAriaMax = useMemo(() => (leftThumb.max && transformValueForAria(leftThumb.max)) ?? rightAriaVal, [leftThumb.max, rightAriaVal])
	const rightAriaMax = useMemo(() => transformValueForAria(max), [max])
	const rightAriaMin = useMemo(() => (rightThumb.min && transformValueForAria(rightThumb.min)) ?? leftAriaVal, [rightThumb.min, leftAriaVal])
	const midAriaVal = useMemo(() => `${leftAriaVal} to ${rightAriaVal}`, [leftAriaVal, rightAriaVal])

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
					max={leftThumb.max ?? rightThumb.value - fineTuneStep}
					thresholds={sliderSnapPoints && thresholds}
					setValue={setLeft}
					getClickPos={getClickPosLeft}
					onClick={leftThumb.onClick}
					ariaVal={leftAriaVal}
					ariaMin={leftAriaMin}
					ariaMax={leftAriaMax}
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
					ariaVal={midAriaVal}
					ariaMin={leftAriaMin}
					ariaMax={rightAriaMax}
					{...common} />
				<SliderThumb
					sliderId={rightId}
					ref={rightRef}
					title={rightThumb.title}
					value={rightThumb.value}
					min={rightThumb.min ?? leftThumb.value + fineTuneStep}
					max={max}
					absoluteMin={min}
					thresholds={sliderSnapPoints && thresholds}
					setValue={setRight}
					getClickPos={getClickPosRight}
					onClick={rightThumb.onClick}
					ariaVal={rightAriaVal}
					ariaMin={rightAriaMin}
					ariaMax={rightAriaMax}
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

const thumbPropType = shape({
	name: string.isRequired,
	title: string,
	value: oneOfType([oneOf(['']), number]).isRequired,
	min: number,
	max: number,
	onChange: func.isRequired,
	onClick: oneOfType([oneOf([false]), func]),
	onDoubleClick: oneOfType([oneOf([false]), func])
})

SliderDouble.propTypes = {
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
	enableAutoCenter: bool,
	disabled: bool,
	transformValueForAria: func
}

export default SliderDouble
