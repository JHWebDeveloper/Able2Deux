import React, { createRef, useCallback, useContext, useId, useMemo, useRef } from 'react'
import { arrayOf, bool, func, number, oneOf, oneOfType, shape, string } from 'prop-types'

import { PrefsContext } from 'store'

import SliderThumb from './SliderThumb'
import SliderSnapMarkers from './SliderSnapMarkers'

const setValue = ({ name, onChange }, val) => onChange({
	name,
	value: parseFloat(val.toFixed(2))
})

const SliderDouble = ({
	leftThumb = {
		name: '',
		title: '',
		alignment: 'right',
		value: 0,
		max,
		onChange() {},
		onClick: false,
		onDoubleClick: false
	},
	rightThumb = {
		name: '',
		title: '',
		alignment: 'left',
		value: 100,
		min,
		onChange() {},
		onClick: false,
		onDoubleClick: false
	},
	min = 0,
	max = 100,
	step = 1,
	microStep = 0.1,
	macroStep = 10,
	snapPoints = [],
	sensitivity = 4,
	sliderTitle = '',
	hasMiddleThumb = true,
	middleThumbTitle = '',
	onPan = () => {},
	enableAutoCenter = false,
	disabled = false,
	transformValueForAria = val => val
}) => {
	const { sliderSnapPoints } = useContext(PrefsContext).preferences

	const leftRef = createRef(null)
	const rightRef = createRef(null)
	const trackRef = useRef(null)
	
	const thumbId = useId()
	const leftId = `${thumbId}_l`
	const rightId = `${thumbId}_r`
	const middleId = hasMiddleThumb && `${thumbId}_m`
	const diff = useMemo(() => max - min, [min, max])
	const diffLR = useMemo(() => rightThumb.value - leftThumb.value, [leftThumb.value, rightThumb.value])
	const width = useMemo(() => hasMiddleThumb && diffLR / diff * 100, [diff, diffLR])

	const leftAriaVal = useMemo(() => transformValueForAria(leftThumb.value), [leftThumb.value])
	const rightAriaVal = useMemo(() => transformValueForAria(rightThumb.value), [rightThumb.value])
	const leftAriaMin = useMemo(() => transformValueForAria(min), [min])
	const leftAriaMax = useMemo(() => (leftThumb.max && transformValueForAria(leftThumb.max)) ?? rightAriaVal, [leftThumb.max, rightAriaVal])
	const rightAriaMax = useMemo(() => transformValueForAria(max), [max])
	const rightAriaMin = useMemo(() => (rightThumb.min && transformValueForAria(rightThumb.min)) ?? leftAriaVal, [rightThumb.min, leftAriaVal])
	const midAriaVal = useMemo(() => hasMiddleThumb && `${leftAriaVal} to ${rightAriaVal}`, [leftAriaVal, rightAriaVal])

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
		if (e.target !== e.currentTarget) return false

		const track = getTrack()
		const mousePos = (e.clientX - track.left) / track.width * diff + min
		const halfPoint = diffLR / 2 + leftThumb.value

		if (mousePos <= halfPoint) {
			setLeft(mousePos)
			e.target = document.getElementById(leftId)
			leftRef.current?.startDrag(e, 0)
		} else if (mousePos > halfPoint) {
			setRight(mousePos)
			e.target = document.getElementById(rightId)
			rightRef.current?.startDrag(e, 0)
		}
	}, [leftThumb.onChange, rightThumb.onChange, diff, diffLR, min])

	const autoCenter = useCallback(() => {
		if (enableAutoCenter) setBoth(50 - diffLR / 2)
	}, [onPan, diffLR])

	const commonProps = { diff, step, microStep, macroStep, getTrack }

	return (
		<span
			className={`slider${disabled ? ' disabled' : ''}`}
			title={sliderTitle}
			aria-label={sliderTitle}>
			<span
				className="slider-track double"
				ref={trackRef}
				onMouseDown={jumpToPosition}>
				<SliderThumb
					sliderId={leftId}
					ref={leftRef}
					title={leftThumb.title}
					alignment={leftThumb.alignment || 'right'}
					value={leftThumb.value}
					min={min}
					max={leftThumb.max ?? rightThumb.value - microStep}
					thresholds={sliderSnapPoints && thresholds}
					setValue={setLeft}
					onClick={leftThumb.onClick}
					ariaVal={leftAriaVal}
					ariaMin={leftAriaMin}
					ariaMax={leftAriaMax}
					{...commonProps} />
				{hasMiddleThumb ? (
					<SliderThumb
						sliderId={middleId}
						title={middleThumbTitle}
						value={leftThumb.value}
						width={width}
						alignment="left"
						min={min}
						max={max - diffLR}
						setValue={setBoth}
						onDoubleClick={enableAutoCenter && autoCenter}
						ariaVal={midAriaVal}
						ariaMin={leftAriaMin}
						ariaMax={rightAriaMax}
						{...commonProps} />
				) : <></>}
				<SliderThumb
					sliderId={rightId}
					ref={rightRef}
					title={rightThumb.title}
					alignment={rightThumb.alignment || 'left'}
					value={rightThumb.value}
					min={rightThumb.min ?? leftThumb.value + microStep}
					max={max}
					absoluteMin={min}
					thresholds={sliderSnapPoints && thresholds}
					setValue={setRight}
					onClick={rightThumb.onClick}
					ariaVal={rightAriaVal}
					ariaMin={rightAriaMin}
					ariaMax={rightAriaMax}
					{...commonProps} />
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
	alignment: oneOf(['left', 'center', 'right']),
	value: oneOfType([oneOf(['']), number]).isRequired,
	min: number,
	max: number,
	onChange: func.isRequired,
	onClick: oneOfType([oneOf([false]), func]),
	onDoubleClick: oneOfType([oneOf([false]), func])
})

SliderDouble.propTypes = {
	leftThumb: thumbPropType.isRequired,
	rightThumb: thumbPropType.isRequired,
	min: number,
	max: number,
	step: number,
	microStep: number,
	macroStep: number,
	snapPoints: arrayOf(number),
	sensitivity: number,
	sliderTitle: string,
	hasMiddleThumb: bool,
	middleThumbTitle: string,
	onPan: func,
	enableAutoCenter: bool,
	disabled: bool,
	transformValueForAria: func
}

export default SliderDouble
