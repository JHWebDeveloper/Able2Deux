import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { arrayOf, bool, exact, func, number, string } from 'prop-types'

import {
	clamp,
	classNameBuilder,
	createCurvePoint,
	CSPL,
	pythagorean,
	throttle
} from 'utilities'

const drawCurve = (ctx, pts, curveColor) => {
	const [ xs, ys, ks ] = pts.reduce((acc, pt) => {
		if (!pt.hidden) {
			acc[0].push(pt.x),
			acc[1].push(pt.y)
		}

		return acc
	}, [[], [], []])

	CSPL.getNaturalKs(xs, ys, ks)

	ctx.beginPath()
	ctx.moveTo(0, ys[0])
	ctx.lineTo(xs[0], ys[0])

	const f = x => CSPL.evalSpline(x, xs, ys, ks)
	const len = xs.length - 1
	const step = 0.1
 
	xs[0] += step
	
	for (let i = 0; i < len; i++) {
		const next = xs[i + 1]

		for (let x = xs[i]; x < next; x += step) {
			ctx.lineTo(x, clamp(f(x), 0, 256))
		}
	}

	ctx.lineTo(256, ys[len])

	ctx.save()
	ctx.strokeStyle = curveColor
	ctx.stroke()
	ctx.restore()
	ctx.closePath()
	ctx.restore()
}

const drawGridLine = (ctx, x0, y0, x1, y1) => {
	ctx.beginPath()
	ctx.moveTo(x0, y0)
	ctx.lineTo(x1, y1)
	ctx.stroke()
	ctx.closePath()
}

const drawGridLines = (ctx, width, height, rows, cols = rows) => {
	const rowGap = height / rows
	const colGap = width / cols
	let colLines = cols - 1
	let rowLines = rows - 1
	let xPos = colGap
	let yPos = rowGap

	ctx.save()
	ctx.lineWidth = 0.25

	while (rowLines && colLines) {
		drawGridLine(ctx, 0, yPos, height, yPos)
		drawGridLine(ctx, xPos, 0, xPos, width)
		yPos += rowGap
		xPos += colGap
		rowLines--
		colLines--
	}

	while (rowLines--) {
		drawGridLine(ctx, 0, yPos, height, yPos)
		yPos += rowGap
	}

	while (colLines--) {
		drawGridLine(ctx, xPos, 0, xPos, width)
		xPos += colGap
	}

	ctx.restore()
}

const drawCrossHairs = (ctx, x, y) => {
	ctx.save()
	ctx.lineWidth = 0.125
	drawGridLine(ctx, x, 0, x, 256)
	drawGridLine(ctx, 0, y, 256, y)
	ctx.restore()
}

const drawDots = (ctx, pts, selectedId, dotColor) => {
	ctx.save()
	ctx.fillStyle = dotColor
	ctx.strokeStyle = dotColor

	for (const { hidden, id, x, y } of pts) {
		if (hidden) continue

		ctx.beginPath()
		ctx.rect(x - 3, y - 3, 6, 6)
		
		if (id === selectedId) {
			ctx.fill()
			ctx.strokeStyle = '#000'
			drawCrossHairs(ctx, x, y)
		} else {
			ctx.stroke()
		}

		ctx.closePath()
	}

	ctx.restore()
}

const detectCollisions = (pts, r = 144) => (x, y) => {
	for (const pt of pts) {
		if (pythagorean(pt.x - x, pt.y - y) < r) return pt
	}

	return false
}

const Curves = forwardRef(({
	curve,
	curveColor,
	backgroundCurves = [],
	addCurvePoint,
	addOrUpdateCurvePoint,
	deleteCurvePoint,
	cleanupCurve,
	disabled
}, curvesRef) => {
	const [ selectedPoint, setSelectedPoint ] = useState({})
	const cnv = useRef(null)
	const ctx = useRef(null)

	const moveSelectedPoint = useCallback((pointData, offsetTop, offsetLeft) => e => {		
		const { id, offsetX, offsetY, boundL, boundR, limit } = pointData

		const newPos = {
			id: id,
			x: Math.round(e.clientX - offsetLeft + offsetX),
			y: Math.round(e.clientY - offsetTop + offsetY),
			limit
		}

		const outOfBounds = newPos.x < boundL || newPos.x > boundR || newPos.y < 0 || newPos.y > 256

		if (limit && outOfBounds) {
			newPos.x = clamp(newPos.x, boundL, boundR)
			newPos.y = clamp(newPos.y, 0, 256)
		} else if (outOfBounds) {
			newPos.hidden = true
		}

		addOrUpdateCurvePoint(newPos)
	}, [addOrUpdateCurvePoint])

	const createPointAndGetData = useCallback((pointData, points) => {
		pointData = createCurvePoint(pointData.x, pointData.y)
		
		addCurvePoint(pointData)
		
		return selectPointAndGetData(pointData, points)
	}, [addCurvePoint])

	const selectPointAndGetData = useCallback((pointData, points, offsets = {}) => {		
		pointData = {
			...pointData,
			boundR: (points.find(pt => pt.id !== pointData.id && pt.x >= pointData.x)?.x ?? 260) - 4,
			boundL: (points.findLast(pt => pt.id !== pointData.id && pt.x <= pointData.x)?.x ?? -4) + 4,
			offsetX: offsets.x ? pointData.x - offsets.x : 0,
			offsetY: offsets.y ? pointData.y - offsets.y : 0
		}

		setSelectedPoint({
			id: pointData.id,
			limit: pointData.limit
		})

		return pointData
	}, [])

	const selectOrCreateNewPoint = useCallback(e => {
		const { top, left } = cnv.current.getBoundingClientRect()

		const clickData = {
			x: Math.round(e.clientX - left),
			y: Math.round(e.clientY - top)
		}

		const collision = detectCollisions(curve)(clickData.x, clickData.y)
		const firstPt = curve[0]
		const lastPt = curve.at(-1)
		let pointData = {}

		if (collision) {
			pointData = selectPointAndGetData(collision, curve, clickData)
		} else if (clickData.x < firstPt.x) {
			pointData = selectPointAndGetData(firstPt, curve, clickData)
		} else if (clickData.x > lastPt.x) {
			pointData = selectPointAndGetData(lastPt, curve, clickData)
		} else {
			pointData = createPointAndGetData(clickData, curve)
		}

		const onMouseMove = throttle(moveSelectedPoint(pointData, top, left), 30)

		onMouseMove(e)

		const onMouseUp = () => {
			cleanupCurve()
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('contextmenu', onMouseUp)
		}

		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('contextmenu', onMouseUp)
	}, [curve, addOrUpdateCurvePoint, cleanupCurve])

	const deleteSelectedPoint = useCallback(e => {
		if (e.key !== 'Backspace') return false

		if (!selectedPoint.limit) deleteCurvePoint(selectedPoint.id)

		setSelectedPoint({})
	}, [selectedPoint, deleteCurvePoint])

	const revertCursorIcon = useCallback(() => {
		cnv.current.style.removeProperty('cursor')
	}, [])

	const setCursorIcon = useCallback(throttle(e => {
		const { top, left } = cnv.current.getBoundingClientRect()

		if (detectCollisions(curve)(e.clientX - left, e.clientY - top)) {
			cnv.current.style.cursor = 'move'
		} else {
			revertCursorIcon()
		}
	}, 60), [curve])

	useImperativeHandle(curvesRef, () => ({ setSelectedPoint }), [])

	useEffect(() => {
		cnv.current.width = 256
		cnv.current.height = 256
		ctx.current = cnv.current.getContext('2d')
	}, [])

	useEffect(() => {
		ctx.current.clearRect(0, 0, 256, 256)

		drawGridLines(ctx.current, 256, 256, 4)

		if (disabled) return

		for (const bgCurve of backgroundCurves) {
			drawCurve(ctx.current, bgCurve.data, bgCurve.color)
		}
		
		drawCurve(ctx.current, curve, curveColor)
		drawDots(ctx.current, curve, selectedPoint.id, curveColor)
	}, [selectedPoint.id, curve, curveColor, disabled])

	return (
		<div className={classNameBuilder({
			curves: true,
			disabled
		})}>
			<span aria-hidden></span>
			<canvas
				tabIndex="0"
				ref={cnv}
				onKeyDown={deleteSelectedPoint}
				onMouseDown={selectOrCreateNewPoint}
				onMouseMove={setCursorIcon}
				onMouseOut={revertCursorIcon}
				onBlur={() => setSelectedPoint({})}></canvas>
			<span aria-hidden></span>
		</div>
	)
})

const pointPropType = exact({
	id: string,
	hidden: bool,
	limit: bool,
	x: number,
	y: number
})

Curves.propTypes = {
	curve: arrayOf(pointPropType),
	curveColor: string.isRequired,
	backgroundCurves: arrayOf(exact({
		color: string,
		data: arrayOf(pointPropType)
	})),
	addCurvePoint: func.isRequired,
	addOrUpdateCurvePoint: func.isRequired,
	deleteCurvePoint: func.isRequired,
	cleanupCurve: func.isRequired,
	disabled: bool.isRequired
}

export default Curves
