import { has11pmBackground } from '.'

const buildSourceName = (src, prefix, maxLength) => (
	`${prefix ? 'Source: ' : ''}${src.replace(/^(source|courtesy):/ig, '').trim()}`.slice(0, maxLength)
)

const buildGenericSource = (() => {
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

	return (ctx, sourceName, prefix, height, onTop) => {
		const { fontSize, txtX, txtY, minW, pad, boxY, boxH } = layout[height](onTop)

		const src = buildSourceName(sourceName, prefix, 60)

		ctx.font = `${fontSize}px Gotham`
		ctx.textAlign = 'center'
		ctx.fillText(src, txtX, txtY)

		const boxW = Math.max(minW, ctx.measureText(src).width + pad)

		ctx.fillStyle = 'rgba(0,0,0,0.4)'
		ctx.fillRect(txtX - boxW / 2, boxY, boxW, boxH)

		return {}
	}
})()

const build11pmSource = (() => { 
	const layout = {
		'720': onTop => ({
			fontSize: 23.72,
			txtX: 1088,
			txtY: onTop ? 95 : 641,
			maxW: onTop ? 1087 : 984,
			padL: 16,
			padR: 193,
			boxY: onTop ? 70 : 617,
			boxH: 33
		}),
		'1080': onTop => ({
			fontSize: 35.95,
			txtX: 1632,
			txtY: onTop ? 142 : 961.5,
			maxW: onTop ? 1630.5 : 1476,
			padL: 24,
			padR: 289.5,
			boxY: onTop ? 105 : 925.5,
			boxH: 49.5
		})
	}

	return (ctx, sourceName, prefix, height, onTop) => {
		const { fontSize, txtX, txtY, maxW, padL, padR, boxY, boxH } = layout[height](onTop)

		const src = buildSourceName(sourceName, prefix, onTop ? 53 : 47).toUpperCase()

		ctx.font = `500 ${fontSize}px Gotham`
		ctx.textAlign = 'right'
		ctx.fillText(src, txtX, txtY)

		const txtW = ctx.measureText(src).width
		const boxW = Math.min(maxW, txtW + padL + padR)
		const boxX = txtX - txtW - padL

		return {
			x: boxX,
			y: boxY,
			width: boxW,
			height: boxH
		}
	}
})()

export const buildSource = (source, output, background) => {
	const { sourceName, prefix, onTop } = source

	const is11pm = has11pmBackground(background)

	const cnv = document.createElement('canvas')
	const ctx = cnv.getContext('2d')
	const [ width, height ] = output.split('x')

	cnv.width = width
	cnv.height = height

	ctx.globalCompositeOperation = 'destination-over'
	ctx.fillStyle = '#ffffff'

	const srcBoxData = (is11pm ? build11pmSource : buildGenericSource)(ctx, sourceName, prefix, height, onTop)

	return {
		base64: cnv.toDataURL().replace(/^data:image\/\w+;base64,/, ''),
		is11pm,
		...srcBoxData
	}
}
