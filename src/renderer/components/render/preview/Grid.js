import React, { createRef, useEffect } from 'react'

const Grid = ({ grids, gridColor }) => {
	const ref = createRef()

	useEffect(() => {
		const cnv = ref.current
		const ctx = cnv.getContext('2d')
	
		cnv.width = 384
		cnv.height = 216

		ctx.lineWidth = 1.25
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
	}, [grids, gridColor])

	return <canvas ref={ref}></canvas>
}

export default Grid
