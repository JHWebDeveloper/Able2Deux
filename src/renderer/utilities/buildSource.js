const layout = {
	'720': onTop => ({
		fontSize: 25,
		txtX: 640, 
		txtY: onTop ? 53 : 664,
		minW: 330,
		pad: 40,
		boxY: onTop ? 28 : 639,
		boxH: 33
	}),
	'1080': onTop => ({
		fontSize: 37.5,
		txtX: 960,
		txtY: onTop ? 103.5 : 996,
		minW: 495,
		pad: 60,
		boxY: onTop ? 66 : 958.5,
		boxH: 49.5
	})
}

const cleanSourceName = src => src.replace(/^(source:|courtesy:)/ig, '').trim()

export const buildSource = (source, output) => {
	const { sourceName, prefix, onTop } = source
	const src = `${prefix ? 'Source: ' : ''}${cleanSourceName(sourceName)}`

	const cnv = document.createElement('canvas')
	const ctx = cnv.getContext('2d')
	const [ width, height ] = output.split('x')
	const { fontSize, txtX, txtY, minW, pad, boxY, boxH } = layout[height](onTop)

	cnv.width = width
	cnv.height = height

	ctx.globalCompositeOperation = 'destination-over'

	ctx.fillStyle = '#ffffff'
	ctx.font      = `${fontSize}px Gotham`
	ctx.textAlign = 'center'
	ctx.fillText(src, txtX, txtY)

	const txtW = Math.max(minW, ctx.measureText(src).width + pad)

	ctx.fillStyle = 'rgba(0,0,0,0.4)'
	ctx.fillRect(txtX - txtW / 2, boxY, txtW, boxH)

	return cnv.toDataURL().replace(/^data:image\/\w+;base64,/, '')
}
