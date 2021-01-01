import React, { useEffect, useRef } from 'react'
import { bool, exact, string } from 'prop-types'

let cnv = false
let ctx = false

const Grid = props => {
	const { grids, gridColor, enableWidescreenGrids } = props
	const ref = useRef()
	
	useEffect(() => {
		cnv = ref.current
		ctx = cnv.getContext('2d')

		cnv.width = 384
		cnv.height = 216
		ctx.lineWidth = 1.25
	}, [])

	useEffect(() => {
		ctx.clearRect(0, 0, cnv.width, cnv.height)
		ctx.strokeStyle = gridColor
		
		if (grids.grid) {
			ctx.strokeRect(9.6, 5.4, 364.8, 205.2)
			ctx.strokeRect(19.2, 10.8, 345.6, 194.4)
	
			ctx.beginPath()
	
			ctx.moveTo(192, 0)
			ctx.lineTo(192, 216)
			ctx.moveTo(0, 108)
			ctx.lineTo(384, 108)
	
			ctx.moveTo(120, 72)
			ctx.lineTo(136, 72)
			ctx.moveTo(128, 64)
			ctx.lineTo(128, 80)
	
			ctx.moveTo(248, 72)
			ctx.lineTo(264, 72)
			ctx.moveTo(256, 64)
			ctx.lineTo(256, 80)
	
			ctx.moveTo(248, 144)
			ctx.lineTo(264, 144)
			ctx.moveTo(256, 136)
			ctx.lineTo(256, 152)
	
			ctx.moveTo(120, 144)
			ctx.lineTo(136, 144)
			ctx.moveTo(128, 136)
			ctx.lineTo(128, 152)
			
			ctx.stroke()
		}

		if (grids._43) {
			ctx.beginPath()
			ctx.moveTo(48, 0)
			ctx.lineTo(48, 216)
			ctx.moveTo(336, 0)
			ctx.lineTo(336, 216)
			ctx.stroke()
		}

		if (grids._11) {
			ctx.beginPath()
			ctx.moveTo(84, 0)
			ctx.lineTo(84, 216)
			ctx.moveTo(300, 0)
			ctx.lineTo(300, 216)
			ctx.stroke()
		}

		if (grids._916) {
			ctx.beginPath()
			ctx.moveTo(131.25, 0)
			ctx.lineTo(131.25, 216)
			ctx.moveTo(252.75, 0)
			ctx.lineTo(252.75, 216)
			ctx.stroke()
		}

		if (enableWidescreenGrids) {
			if (grids._185) {
				ctx.beginPath()
				ctx.moveTo(0, 4.21621621622)
				ctx.lineTo(384, 4.21621621622)
				ctx.moveTo(0, 211.783783784)
				ctx.lineTo(384, 211.783783784)
				ctx.stroke()
			}
	
			if (grids._239) {
				ctx.beginPath()
				ctx.moveTo(0, 27.6652719665)
				ctx.lineTo(384, 27.6652719665)
				ctx.moveTo(0, 188.334728033)
				ctx.lineTo(384, 188.334728033)
				ctx.stroke()
			}
		}
	}, [props])

	return <canvas ref={ref}></canvas>
}

Grid.propTypes = {
	grids: exact({
		grid: bool,
		_239: bool,
		_185: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}).isRequired,
	gridColor: string.isRequired,
	enableWidescreenGrids: bool.isRequired
}

export default Grid
