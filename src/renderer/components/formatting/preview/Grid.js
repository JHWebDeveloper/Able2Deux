import React, { useCallback, useEffect, useRef } from 'react'
import { arrayOf, bool, exact, number, string } from 'prop-types'

const Grid = props => {
	const { showGrid, gridColor, aspectRatioMarkers } = props
	const cnv = useRef()
	const ctx = useRef()

	const drawGridMarkers = useCallback(coords => {
		let i = coords.length
	
		ctx.current.beginPath()
	
		while (i--) {
			const [ x1, y1, x2, y2 ] = coords[i]
	
			ctx.current.moveTo(x1, y1)
			ctx.current.lineTo(x2, y2)
		}
	
		ctx.current.stroke()
	}, [ctx])

	const drawAspectRatioMarkers = useCallback((antecedent, consequent) => {
		const { width, height } = cnv.current
		const frameRatio = width / height
		const markerRatio = antecedent / consequent
		const coords = [[0, 0, 0, 0], [0, 0, 0, 0]]
	
		if (markerRatio < frameRatio) {
			const markerGap = markerRatio * height / width * width
			const markerPad = (width - markerGap) / 2
	
			coords[0][0] = coords[0][2] = markerPad
			coords[0][3] = coords[1][3] = height
			coords[1][0] = coords[1][2] = markerGap + markerPad
		} else {
			const markerGap = consequent / antecedent * frameRatio * height
			const markerPad = (height - markerGap) / 2
	
			coords[0][1] = coords[0][3] = markerPad
			coords[0][2] = coords[1][2] = width
			coords[1][1] = coords[1][3] = markerGap + markerPad
		}
	
		drawGridMarkers(coords)
	}, [cnv, ctx])
	
	useEffect(() => {
		cnv.current.width = 384
		cnv.current.height = 216
		ctx.current = cnv.current.getContext('2d')
		ctx.current.lineWidth = 1.25
	}, [])

	useEffect(() => {
		ctx.current.clearRect(0, 0, cnv.current.width, cnv.current.height)
		ctx.current.strokeStyle = gridColor
		
		if (showGrid) {
			ctx.current.strokeRect(9.6, 5.4, 364.8, 205.2)
			ctx.current.strokeRect(19.2, 10.8, 345.6, 194.4)

			drawGridMarkers([
				[192, 0, 192, 216],
				[0, 108, 384, 108],
				[120, 72, 136, 72],
				[128, 64, 128, 80],
				[248, 72, 264, 72],
				[256, 64, 256, 80],
				[248, 144, 264, 144],
				[256, 136, 256, 152],
				[120, 144, 136, 144],
				[128, 136, 128, 152]
			])
		}

		for (const { disabled, selected, ratio } of aspectRatioMarkers) {
			if (!disabled && selected) drawAspectRatioMarkers(...ratio)
		}
	}, [props, ctx])

	return <canvas ref={cnv}></canvas>
}

Grid.propTypes = {
	showGrid: bool.isRequired,
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	gridColor: string.isRequired
}

export default Grid
