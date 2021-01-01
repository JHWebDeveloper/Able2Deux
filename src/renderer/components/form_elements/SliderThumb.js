import React, { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import { arrayOf, func, number, oneOf, oneOfType, string } from 'prop-types'

import { clamp, throttle } from 'utilities'

/* expose drag values outside of component since state value
   will not update inside drag when drag is attached to window */
const thumbPos = new Map()
const mousePos = new Map()

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
	onDoubleClick,
	absoluteMin
}, thumbRef) => {
	absoluteMin = absoluteMin ?? min

	const triggers = [min, max, width, setValue, thresholds]

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
		thumbPos.set(sliderId, value)
	}, [value])

	return (
		<span
			id={sliderId}
			title={title}
			onMouseDown={startDrag}
			onKeyDown={keyIncrement}
			{...process.env.NODE_ENV === 'production' ? { onContextMenu: e => e.stopPropagation() } : {}}
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
	onDoubleClick: oneOfType([oneOf([false]), func]),
	absoluteMin: number
}

SliderThumb.displayName = 'SliderThumb'

export default SliderThumb
