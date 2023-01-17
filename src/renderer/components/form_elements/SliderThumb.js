import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { arrayOf, func, number, oneOf, oneOfType, string } from 'prop-types'

import { clamp, throttle } from 'utilities'

const getClickPosDefault = e => {
	const { width, right } = e.target.getBoundingClientRect()

	return width / 2 - (right - e.clientX)
}

const snapToPoint = (thresholds, val) => {
	let i = thresholds.length

	while (i--) {
		const th = thresholds[i]
		if (val >= th[1] && val <= th[2]) return th[0]
	}

	return false
}

const SliderThumb = forwardRef(({
	sliderId,
	title,
	value = 0,
	width = false,
	diff = 0,
	min = 0,
	max = 100,
	step = 1,
	fineTuneStep = 0.1,
	thresholds = [],
	setValue,
	getTrack,
	getClickPos,
	onClick,
	onDoubleClick,
	absoluteMin,
	ariaVal = value,
	ariaMin = min,
	ariaMax = max
}, thumbRef) => {
	absoluteMin = absoluteMin ?? min
	
	const thumbPos = useRef(0)
	const mousePos = useRef(0)
	const triggers = [min, max, width, setValue, thresholds]

	const drag = useCallback((clickPos, track) => e => {
		e.preventDefault()

		const nextMousePos = (e.clientX - track.left - clickPos) / track.width * diff + absoluteMin
		const prevMousePos = mousePos.current ?? nextMousePos

		mousePos.current = nextMousePos

		if (nextMousePos === prevMousePos) return false

		let nextThumbPos = prevMousePos
		let point = false

		if (e.shiftKey && nextMousePos < prevMousePos) {
			nextThumbPos = thumbPos.current - fineTuneStep
		} else if (e.shiftKey && nextMousePos > prevMousePos) {
			nextThumbPos = thumbPos.current + fineTuneStep
		} else if (thresholds.length && ((point = snapToPoint(thresholds, nextMousePos)) || point === 0)) { // declaration inside if intended
			nextThumbPos = point
		} else {
			nextThumbPos = (nextMousePos / step << 0) * step
		}

		if (nextThumbPos === thumbPos.current) return false
		
		setValue(clamp(nextThumbPos, min, max))
	}, triggers)

	const startDrag = useCallback((e, clickPos) => {
		e.preventDefault()
		e.stopPropagation()
		e.target.focus()
	
		clickPos = clickPos ?? getClickPos?.(e) ?? getClickPosDefault(e)
	
		const track = getTrack()
		const onMouseMove = throttle(drag(clickPos, track), 60)
	
		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
		}
	
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
	}, triggers)

	useImperativeHandle(thumbRef, () => ({ startDrag }), triggers)

	const keyIncrement = useCallback(e => {
		const rightOrUp = e.key === 'ArrowRight' || e.key === 'ArrowUp'

		if (!rightOrUp && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown') return true

		e.preventDefault()

		const incr = e.shiftKey ? fineTuneStep : step
		const next = rightOrUp
			? Math.min(value + incr, max)
			: Math.max(value - incr, min)

		setValue(next)
	}, [value, min, max, width, setValue])

	useEffect(() => {
		thumbPos.current = value
	}, [value])

	return (
		<span
			id={sliderId}
			title={title}
			onMouseDown={startDrag}
			onKeyDown={keyIncrement}
			{...process.env.NODE_ENV === 'production' ? { onContextMenu: e => e.stopPropagation() } : {}}
			{...onClick ? { onClick } : {}}
			{...onDoubleClick ? { onDoubleClick } : {}}
			style={{
				left: `${clamp((value - absoluteMin) / diff * 100, 0, 100)}%`,
				...width ? { width: `${width}%` } : {}
			}}
			tabIndex="0"
			role="slider"
			aria-label={title}
			aria-valuemin={ariaMin}
			aria-valuemax={ariaMax}
			aria-valuenow={ariaVal}></span>
	)
})

SliderThumb.propTypes = {
	sliderId: string.isRequired,
	title: string,
	value: oneOfType([oneOf(['']), number]),
	width: oneOfType([oneOf([false]), number]),
	diff: number,
	min: number,
	max: number,
	step: number,
	fineTuneStep: number,
	thresholds: arrayOf(arrayOf(number)),
	setValue: func.isRequired,
	getTrack: func.isRequired,
	getClickPos: func,
	onClick: oneOfType([oneOf([false]), func]),
	onDoubleClick: oneOfType([oneOf([false]), func]),
	absoluteMin: number,
	ariaVal: oneOfType([number, string]),
	ariaMin: oneOfType([number, string]),
	ariaMax: oneOfType([number, string])
}

SliderThumb.displayName = 'SliderThumb'

export default SliderThumb
