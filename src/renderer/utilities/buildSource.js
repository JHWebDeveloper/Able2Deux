import { has11pmBackground, toPx } from 'utilities'

// eslint-disable-next-line no-extra-parens
const buildSourceName = (src, prefix, maxLength) => (
	`${prefix ? 'Source: ' : ''}${src.replace(/^(source|courtesy):/ig, '').trim()}`.slice(0, maxLength)
)

const buildGenericSource = (() => {
	const layout = {
		'720': onTop => ({
			fontSize: 13.777778,
			txtX: onTop ? 38 : 1242, 
			txtY: onTop ? 171.333333 : 563.333333,
			maxW: 322,
			pad: 18,
			boxY: onTop ? 148 : 539.333333,
			boxH: 33.333333
		}),
		'1080': onTop => ({
			fontSize: 20.666667,
			txtX: onTop ? 57 : 1863,
			txtY: onTop ? 257 : 845,
			maxW: 483,
			pad: 28,
			boxY: onTop ? 222 : 809,
			boxH: 50
		})
	}

	return ({ ctx, sourceName, sourcePrefix, sourceOnTop, width, height }) => {
		const { fontSize, txtX, txtY, maxW, pad, boxY, boxH } = layout[height](sourceOnTop)

		const src = buildSourceName(sourceName, sourcePrefix, 60)

		ctx.font = `${toPx(fontSize)} Inter`
		ctx.save()
		ctx.globalCompositeOperation = 'source-over'
		ctx.textAlign = sourceOnTop ? 'left' : 'right'
		ctx.textBaseline = 'bottom'
		ctx.lineWidth = 2
		ctx.strokeStyle = '#000000'
		ctx.shadowColor = '#000000'
		ctx.shadowOffsetX = Math.cos(5.35816) + 1 // Converted from .psd that has the shadow angle at 127° and distance at 1px
		ctx.shadowOffsetY = Math.sin(5.35816) + 1
		ctx.strokeText(src, txtX, txtY, maxW)
		ctx.fillText(src, txtX, txtY, maxW)
		ctx.restore()

		const txtW = Math.min(ctx.measureText(src).width, maxW)
		const boxW = (sourceOnTop ? txtX : width - txtX) + txtW + pad

		ctx.fillStyle = 'rgba(0,0,0,0.4)'
		ctx.fillRect(sourceOnTop ? 0 : width - boxW, boxY, boxW, boxH)

		return {}
	}
})()

const build11pmSource = (() => {
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

	return ({ ctx, sourceName, sourcePrefix, height, sourceOnTop }) => {
		const { fontSize, txtX, txtY, minW, pad, boxY, boxH } = layout[height](sourceOnTop)

		const src = buildSourceName(sourceName, sourcePrefix, 60)

		ctx.font = `${toPx(fontSize)} Gotham`
		ctx.textAlign = 'center'
		ctx.fillText(src, txtX, txtY)

		const boxW = Math.max(minW, ctx.measureText(src).width + pad)

		ctx.fillStyle = 'rgba(0,0,0,0.4)'
		ctx.fillRect(txtX - boxW / 2, boxY, boxW, boxH)

		return {}
	}
})()

export const buildSource = ({ sourceName, sourcePrefix, sourceOnTop, renderOutput, is11pm, background }) => {
	is11pm = is11pm ?? has11pmBackground(background)

	const cnv = document.createElement('canvas')
	const ctx = cnv.getContext('2d')
	const [ width, height ] = renderOutput.split('x')
	const srcArgs = { ctx, sourceName, sourcePrefix, sourceOnTop, width, height }

	cnv.width = width
	cnv.height = height

	ctx.globalCompositeOperation = 'destination-over'
	ctx.fillStyle = '#ffffff'

	if (is11pm) {
		build11pmSource(srcArgs)
	} else {
		buildGenericSource(srcArgs)
	}

	return {
		base64: cnv.toDataURL().replace(/^data:image\/\w+;base64,/, '')
	}
}

const toFontURL = font => `url(./assets/font/${font}.woff2)`

export const preloadSourceFont = async is11pm => {
	const font = is11pm
		? new FontFace('Gotham', toFontURL('Gotham-Book'))
		: new FontFace('Inter', toFontURL('Inter-Bold'), { weight: 700 })

	await font.load()

	document.fonts.add(font)
}
