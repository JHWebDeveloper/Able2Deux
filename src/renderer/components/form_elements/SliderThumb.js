import React, { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import { arrayOf, bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { clamp, throttle } from 'utilities'

// expose percentages outside of component since state value
	// will not update inside drag when drag is attached to window
const thumbPos = new Map()
const mousePos = new Map()

const getClickPosDefault = e => {
	const { width, right } = e.target.getBoundingClientRect()

	return width / 2 - (right - e.clientX)
}

const snapToPoint = (thresholds, val) => {
	const point = thresholds.find(pt => val > pt[1] && val < pt[2])

	return point?.[0] ?? false
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
	fineTuneStep = 0.05,
	thresholds = [],
	setValue,
	getTrack,
	getClickPos,
	onDoubleClick,
	absoluteMin
}, thumbRef) => {
	absoluteMin = absoluteMin ?? min

	const drag = useCallback((clickPos, track) => e => {
		e.preventDefault()

		const nextMousePos = (e.clientX - track.left - clickPos) / track.width * diff + absoluteMin
		const prevMousePos = mousePos.get(sliderId) ?? nextMousePos

		mousePos.set(sliderId, nextMousePos)

		if (nextMousePos === prevMousePos) return false

		let nextThumbPos = prevMousePos
		let point = false

		if (e.shiftKey && nextMousePos < prevMousePos) {
			nextThumbPos = thumbPos.get(sliderId) - fineTuneStep
		} else if (e.shiftKey && nextMousePos > prevMousePos) {
			nextThumbPos = thumbPos.get(sliderId) + fineTuneStep
		} else if (thresholds.length && ((point = snapToPoint(thresholds, nextMousePos)) || point === 0)) {
			nextThumbPos = point
		} else {
			nextThumbPos = (nextMousePos / step << 0) * step
		}

		if (nextThumbPos === thumbPos.get(sliderId)) return false
		
		setValue(clamp(nextThumbPos, min, max))
	}, [min, max, width, setValue])

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
	}, [min, max, width, setValue])

	useImperativeHandle(thumbRef, () => ({
		startDrag
	}), [min, max, width, setValue])

	const keyIncrement = useCallback(e => {
		if (!/^Arrow/.test(e.key)) return true

		e.preventDefault()

		const incr = e.shiftKey ? fineTuneStep : step

		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			setValue(Math.max(value - incr, min))
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			setValue(Math.min(value + incr, max))
		}
	}, [value, min, max, width, setValue])

	useEffect(() => {
		thumbPos.set(sliderId, value)
	}, [value])

	return (
		<span
			id={sliderId}
			title={title}
			onMouseDown={startDrag}
			onKeyDown={keyIncrement}
			{...onDoubleClick ? { onDoubleClick } : {}}
			style={{
				left: `${clamp((value - absoluteMin) / diff * 100, 0, 100)}%`,
				...width ? { width: `${width}%` } : {}
			}}
			tabIndex="0"
			role="slider"
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={value}></span>
	)
})

SliderThumb.propTypes = {
	sliderId: string.isRequired,
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
	onDoubleClick: oneOfType([oneOf([false]), func]),
	absoluteMin: number
}

SliderThumb.displayName = 'SliderThumb'

export default SliderThumb