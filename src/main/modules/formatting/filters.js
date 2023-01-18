/**
 * Storing larger static chunks of command strings in variables in the
 * IIFE scope of the respective filter. Dev acknowledges the readability hit,
 * but preview rendering speed is so crucial to app, performance is favored here.
 */

// ---- SHARED COMMAND CONSTANTS --------

const shortestAndFormat = ':shortest=1:format=auto'

const overlayDimCmdChunks = [
	'[tooverlay];[tooverlay]scale=w=',
	':force_original_aspect_ratio=increase[scaled];[',
	':v][scaled]overlay=(main_w-overlay_w)/2:',
	':shortest=1[positioned];[positioned]['
]

// ---- SHARED COMMAND GENERATING FUNCTIONS --------

const buildKeyFilter = (isPreview, keying) => {
	const { enabled, hidden, type } = keying
	let filter = ''

	if (enabled && type === 'lumakey') {
		filter = `${type}=${keying.threshold / 100}:${keying.tolerance / 100}:${keying.softness / 100}[ky];[ky]`
	} else if (enabled && !(isPreview && hidden)) {
		filter = `${type}=${keying.color}:${keying.similarity / 100}:${keying.blend / 100}[ky];[ky]`
	}

	return filter
}

const normalizeCurve = pts => pts
	.filter(pt => !pt.hidden)
	.map(pt => `${pt.x / 256}/${(256 - pt.y) / 256}`)
	.join(' ')

// eslint-disable-next-line no-extra-parens
const buildCurvesFilter = ({ rgb, r, g, b }) => (
	`curves=m='${normalizeCurve(rgb)}':r='${normalizeCurve(r)}':g='${normalizeCurve(g)}':b='${normalizeCurve(b)}',format=yuv420p[cc];[cc]`
)

const buildCommonFilter = (isPreview, reflect, angle, curves) => {
	let filter = 'null'

	if (reflect && angle) {
		filter = `${reflect},${angle}`
	} else if (reflect) {
		filter = reflect
	} else if (angle) {
		filter = angle
	}

	if (curves.enabled && !(isPreview && curves.hidden)) filter = `${buildCurvesFilter(curves)}${filter}`

	return filter
}

const getBGLayerNumber = (sourceData, overlayDim) => {
	let bgNo = overlayDim ? 3 : 1

	if (sourceData) bgNo++

	return bgNo
}

const buildSrcLayer = (() => {
	const cmdChunks = [
		'[srcbg];[tosrc][srcbg]overlay=',
		':shortest=1:format=auto[tosrc2];[tosrc2]'
	]

	return sourceData => {
		let filter = '[tosrc];'

		if (sourceData.is11pm) {
			const { x, y, width, height } = sourceData

			filter = `${filter}[2:v]crop=${width}:${height}:${x}:${y}${cmdChunks[0]}${x}:${y}${cmdChunks[1]}`
		} else {
			filter = `${filter}[tosrc]`
		}

		return `${filter}[1:v]overlay`
	}
})()

const previewResize = (() => {
	const cmdChunks = ':force_original_aspect_ratio=decrease'

	return ({ width, height }) => `scale=w=${width}:h=${height}${cmdChunks}`
})()

const previewMixdown = size => `[final];[final]${previewResize(size)}`

const finalize = ({ filter, sourceData, overlayDim, isPreview, previewSize }) => {
	if (sourceData) filter = `${filter}${buildSrcLayer(sourceData)}`
	if (overlayDim) filter = `${filter}${overlayDimCmdChunks[0]}${overlayDim.width}:h=${overlayDim.height}${overlayDimCmdChunks[1]}${sourceData ? 2 : 1}${overlayDimCmdChunks[2]}${overlayDim.y}${overlayDimCmdChunks[3]}${sourceData ? 3 : 2}:v]overlay`
	if (isPreview) filter = `${filter}${previewMixdown(previewSize)}`

	return filter
}

// ---- FILTER COMMAND GENERATING FUNCTIONS --------

export const none = (() => {
	const cmdChunks = '[vid];[vid][1:v]overlay'

	return (filterData, isPreview, previewSize) => {
		const { reflect, angle, colorCurves, sourceData, renderWidth, renderHeight } = filterData

		let filter = buildCommonFilter(isPreview, reflect, angle, colorCurves)

		if (sourceData || isPreview) filter = `[0:v]${filter}`
		if (sourceData) filter = `${filter},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks}`

		if (sourceData && isPreview) {
			filter = `${filter}${previewMixdown(previewSize)}`
		} else if (isPreview) {
			filter = `${filter},${previewResize(previewSize)}`
		}

		return filter ? filter : 'nullsink'
	}
})()

export const fill = (() => {
	const cmdChunks = [
		':force_original_aspect_ratio=increase,crop=',
		'*(iw-ow)/2:(ih-oh)/2+',
		':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
	]

	return (filterData, isPreview, previewSize) => {
		const { keying, reflect, angle, colorCurves, sourceData, overlayDim, renderWidth, renderHeight, hasAlpha } = filterData
		let { centering } = filterData

		centering /= -100

		let filter = `[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, reflect, angle, colorCurves)},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks[0]}${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}${cmdChunks[1]}${centering}*(ih-oh)/2`

		if (hasAlpha || keying.enabled) {
			filter = `${filter}[fg];[${getBGLayerNumber(sourceData, overlayDim)}${cmdChunks[2]}${shortestAndFormat}`
		}

		return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
	}
})()

export const fit = (() => {
	const cmdChunks = [
		':force_original_aspect_ratio=decrease[fg];',
		':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
	]

	return (filterData, isPreview, previewSize) => {
		const { keying, reflect, colorCurves, angle, sourceData, overlayDim, renderWidth, renderHeight } = filterData

		const filter = [
			`[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, reflect, angle, colorCurves)},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks[0]}`,
			`[${getBGLayerNumber(sourceData, overlayDim)}${cmdChunks[1]}${shortestAndFormat}`
		].join('')

		return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
	}
})()

export const transform = (() => {
	const cmdChunks = [
		'*ih:exact=1,scale=w=',
		',rotate=\'',
		'*PI/180:ow=hypot(iw,ih):oh=ow:oh=ow:c=none\'',
		':v][fg]overlay=(main_w-overlay_w)/2+',
		'*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+',
		'*(main_h/2+overlay_h/2)'
	]

	return (filterData, isPreview, previewSize) => {
		const { crop, scale, position, keying, reflect, angle, colorCurves, offset, sourceData, overlayDim } = filterData

		const cropH = (crop.b - crop.t) / 100
		const cropW = (crop.r - crop.l) / 100

		crop.t /= 100
		crop.l /= 100
		scale.x /= 100
		scale.y /= 100
		position.x /= 100
		position.y /= 100

		const filter = [
			`[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, reflect, angle, colorCurves)},crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}${cmdChunks[0]}${scale.x || 0.005}*iw:h=${scale.y || 0.005}*ih${offset === 0 ? '' : `${cmdChunks[1]}${offset}${cmdChunks[2]}`}[fg];`,
			`[${getBGLayerNumber(sourceData, overlayDim)}${cmdChunks[3]}${position.x}${cmdChunks[4]}${position.y}${cmdChunks[5]}${shortestAndFormat}`
		].join('')

		return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
	}
})()

export const videoToBars = (() => {
	const cmdChunks = [
		':force_original_aspect_ratio=decrease,pad=',
		'[vid];[vid][1:v]overlay'
	]

	return filterData => {
		const { renderWidth, renderHeight } = filterData

		return `[0:v]scale=${renderWidth}:${renderHeight}${cmdChunks[0]}${renderWidth}:${renderHeight}${cmdChunks[1]}`
	}
})()
