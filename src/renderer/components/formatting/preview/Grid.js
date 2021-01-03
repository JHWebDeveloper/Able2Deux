import React, { useCallback, useEffect, useRef } from 'react'
import { bool, exact, string } from 'prop-types'

const Grid = props => {
	const { grids, gridColor, gridButtons } = props
	const cnv = useRef()
	const ctx = useRef()

	const drawGridMarkers = useCallback(lines => {
		let i = lines.length
	
		ctx.current.beginPath()
	
		while (i--) {
			const [ x1, y1, x2, y2 ] = lines[i]
	
			ctx.current.moveTo(x1, y1)
			ctx.current.lineTo(x2, y2)
		}
	
		ctx.current.stroke()
	}, [ctx])
	
	useEffect(() => {
		cnv.current.width = 384
		cnv.current.height = 216
		ctx.current = cnv.current.getContext('2d')
		ctx.current.lineWidth = 1.25
	}, [])

	useEffect(() => {
		ctx.current.clearRect(0, 0, cnv.current.width, cnv.current.height)
		ctx.current.strokeStyle = gridColor
		
		if (grids.grid) {
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

		if (gridButtons._43 && grids._43) {
			drawGridMarkers([
				[48, 0, 48, 216],
				[336, 0, 336, 216]
			])
		}

		if (gridButtons._11 && grids._11) {
			drawGridMarkers([
				[84, 0, 84, 216],
				[300, 0, 300, 216]
			])
		}

		if (gridButtons._916 && grids._916) {
			drawGridMarkers([
				[131.25, 0, 131.25, 216],
				[252.75, 0, 252.75, 216]
			])
		}

		if (gridButtons._239 && grids._239) {
			drawGridMarkers([
				[0, 27.6652719665, 384, 27.6652719665],
				[0, 188.334728033, 384, 188.33472803]
			])
		}

		if (gridButtons._185 && grids._185) {
			drawGridMarkers([
				[0, 4.21621621622, 384, 4.21621621622],
				[0, 211.783783784, 384, 211.783783784]
			])
		}

		if (gridButtons._166 && grids._166) {
			drawGridMarkers([
				[12, 0, 12, 216],
				[372, 0, 372, 216]
			])
		}
	}, [props])

	return <canvas ref={cnv}></canvas>
}

Grid.propTypes = {
	grids: exact({
		grid: bool,
		_239: bool,
		_185: bool,
		_166: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}).isRequired,
	gridButtons: exact({
		_239: bool,
		_185: bool,
		_166: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}),
	gridColor: string.isRequired
}

export default Grid
