import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { arrayOf, func, number, oneOf, oneOfType, string } from 'prop-types'

import { clamp, throttle } from 'utilities'

const createClickPositionGetter = alignment => {
	switch (alignment) {
		case 'left':
			return e => e.clientX - e.target.getBoundingClientRect().left
		case 'right':
			return e => e.clientX - e.target.getBoundingClientRect().right
		default:
			return e => {
				const { width, right } = e.target.getBoundingClientRect()

				return width / 2 - (right - e.clientX)
			}
	}
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
	alignment = 'center',
	diff = 0,
	min = 0,
	max = 100,
	step = 1,
	microStep = 0.1,
	macroStep = 10,
	thresholds = [],
	setValue,
	getTrack,
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
	const dragDepencies = [min, max, width, setValue, thresholds]

	const getClickPos = useMemo(() => createClickPositionGetter(alignment), [alignment])

	const drag = useCallback((clickPos, track) => e => {
		e.preventDefault()

		const nextMousePos = (e.clientX - track.left - clickPos) / track.width * diff + absoluteMin
		const prevMousePos = mousePos.current ?? nextMousePos

		mousePos.current = nextMousePos

		if (nextMousePos === prevMousePos) return false

		let nextThumbPos = prevMousePos
		let point = 0

		if (e.shiftKey && nextMousePos < prevMousePos) {
			nextThumbPos = thumbPos.current - microStep
		} else if (e.shiftKey && nextMousePos > prevMousePos) {
			nextThumbPos = thumbPos.current + microStep
		} else if (thresholds.length && ((point = snapToPoint(thresholds, nextMousePos)) || point === 0)) { // declaration inside if intended
			nextThumbPos = point
		} else {
			nextThumbPos = (nextMousePos / step << 0) * step
		}

		if (nextThumbPos === thumbPos.current) return false
		
		setValue(clamp(nextThumbPos, min, max))
	}, dragDepencies)

	const startDrag = useCallback((e, clickPos) => {
		e.preventDefault()
		e.stopPropagation()
		e.target.focus()
	
		clickPos ??= getClickPos(e)
	
		const track = getTrack()
		const updateSliderValue = drag(clickPos, track)
		const onMouseMove = throttle(updateSliderValue, 60)
	
		const onMouseUp = e => {
			updateSliderValue(e)
			
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('contextmenu', onMouseUp)
		}
	
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('contextmenu', onMouseUp)
	}, dragDepencies)

	useImperativeHandle(thumbRef, () => ({ startDrag }), dragDepencies)

	const keyIncrement = useCallback(e => {
		const rightOrUp = e.key === 'ArrowRight' || e.key === 'ArrowUp'

		if (!rightOrUp && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown') return true

		e.preventDefault()

		const incr = e.altKey && e.shiftKey ? macroStep : e.shiftKey ? microStep : step
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
	alignment: oneOf(['left', 'center', 'right']).isRequired,
	diff: number,
	min: number,
	max: number,
	step: number,
	microStep: number,
	macroStep: number,
	thresholds: arrayOf(arrayOf(number)),
	setValue: func.isRequired,
	getTrack: func.isRequired,
	onClick: oneOfType([oneOf([false]), func]),
	onDoubleClick: oneOfType([oneOf([false]), func]),
	absoluteMin: number,
	ariaVal: oneOfType([number, string]),
	ariaMin: oneOfType([number, string]),
	ariaMax: oneOfType([number, string])
}

SliderThumb.displayName = 'SliderThumb'

export default SliderThumb
