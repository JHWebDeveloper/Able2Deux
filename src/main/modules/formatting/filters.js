const getBGLayerNumber = (sourceData, overlayDim) => {
	let bgNo = overlayDim ? 3 : 1

	if (sourceData) bgNo++

	return bgNo
}

/**
 * Storing larger chunks of command strings in variables outside of their
 * respective functions. Dev acknowledges the readability hit, but preview
 * speed is so crucial to app, performance is favored here.
 */

const shortestAndFormat = ':shortest=1:format=auto'
const previewResize = ({ width, height }) => `scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease`
const previewMixdown = size => `[final];[final]${previewResize(size)}`

const buildSrcLayer = sourceData => {
	let filter = '[tosrc];'

	if (sourceData.is11pm) {
		const { x, y, width, height } = sourceData

		filter = `${filter}[2:v]crop=${width}:${height}:${x}:${y}[srcbg];[tosrc][srcbg]overlay=${x}:${y}:shortest=1:format=auto[tosrc2];[tosrc2]`
	} else {
		filter = `${filter}[tosrc]`
	}

	return `${filter}[1:v]overlay`
}

const overlayDimCmdChunks = [
	'[tooverlay];[tooverlay]scale=w=',
	':force_original_aspect_ratio=increase[scaled];[',
	':v][scaled]overlay=(main_w-overlay_w)/2:',
	':shortest=1[positioned];[positioned]['
]

const finalize = ({ filter, sourceData, overlayDim, isPreview, previewSize }) => {
	if (sourceData) filter = `${filter}${buildSrcLayer(sourceData)}`
	if (overlayDim) filter = `${filter}${overlayDimCmdChunks[0]}${overlayDim.width}:h=${overlayDim.height}${overlayDimCmdChunks[1]}${sourceData ? 2 : 1}${overlayDimCmdChunks[2]}${overlayDim.y}${overlayDimCmdChunks[3]}${sourceData ? 3 : 2}:v]overlay`
	if (isPreview) filter = `${filter}${previewMixdown(previewSize)}`

	return filter
}

const normalizeCurve = pts => pts
	.filter(pt => !pt.hidden)
	.map(pt => `${pt.x / 255}/${(255 - pt.y) / 255}`)
	.join(' ')

// eslint-disable-next-line no-extra-parens
const buildCurvesFilter = ({ rgb, r, g, b }) => (
	`curves=m='${normalizeCurve(rgb)}':r='${normalizeCurve(r)}':g='${normalizeCurve(g)}':b='${normalizeCurve(b)}'[cc];[cc]`
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

const noneCmdLargeChunk = '[vid];[vid][1:v]overlay'

export const none = (filterData, isPreview, previewSize) => {
	const { reflect, angle, colorCurves, sourceData, renderWidth, renderHeight } = filterData

	let filter = buildCommonFilter(isPreview, reflect, angle, colorCurves)

	if (sourceData || isPreview) filter = `[0:v]${filter}`
	if (sourceData) filter = `${filter},scale=w=${renderWidth}:h=${renderHeight}${noneCmdLargeChunk}`

	if (sourceData && isPreview) {
		filter = `${filter}${previewMixdown(previewSize)}`
	} else if (isPreview) {
		filter = `${filter},${previewResize(previewSize)}`
	}

	return filter ? filter : 'nullsink'
}

const fillCmdChunks = [
	':force_original_aspect_ratio=increase,crop=',
	'*(iw-ow)/2:(ih-oh)/2+',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

const buildKeyFilter = (isPreview, keying) => {
	const { enabled, hidden, type, color, similarity, blend } = keying

	if (!enabled || isPreview && hidden) return ''

	return `${type}=${color}:${similarity / 100}:${blend / 100}[ky];[ky]`
}

export const fill = (filterData, isPreview, previewSize) => {
	const { keying, reflect, angle, colorCurves, sourceData, overlayDim, renderWidth, renderHeight, hasAlpha } = filterData
	let { centering } = filterData

	centering /= -100

	let filter = `[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, reflect, angle, colorCurves)},scale=w=${renderWidth}:h=${renderHeight}${fillCmdChunks[0]}${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}${fillCmdChunks[1]}${centering}*(ih-oh)/2`

	if (hasAlpha || keying.enabled) {
		filter = `${filter}[fg];[${getBGLayerNumber(sourceData, overlayDim)}${fillCmdChunks[2]}${shortestAndFormat}`
	}

	return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
}

const fitCmdChunks = [
	':force_original_aspect_ratio=decrease[fg];',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fit = (filterData, isPreview, previewSize) => {
	const { keying, reflect, colorCurves, angle, sourceData, overlayDim, renderWidth, renderHeight } = filterData

	const filter = [
		`[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, reflect, angle, colorCurves)},scale=w=${renderWidth}:h=${renderHeight}${fitCmdChunks[0]}`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${fitCmdChunks[1]}${shortestAndFormat}`
	].join('')

	return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
}

const transformCmdChunks = [
	'*ih:exact=1,scale=w=',
	':v][fg]overlay=(main_w-overlay_w)/2+',
	'*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+',
	'*(main_h/2+overlay_h/2)'
]

const offsetCmdChunks = [
	',rotate=\'',
	'*PI/180:ow=hypot(iw,ih):oh=ow:oh=ow:c=none\''
]

export const transform = (filterData, isPreview, previewSize) => {
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
		`[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, reflect, angle, colorCurves)},crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}${transformCmdChunks[0]}${scale.x || 0.005}*iw:h=${scale.y || 0.005}*ih${offset === 0 ? '' : offsetCmdChunks.join(offset)}[fg];`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${transformCmdChunks[1]}${position.x}${transformCmdChunks[2]}${position.y}${transformCmdChunks[3]}${shortestAndFormat}`
	].join('')

	return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
}

const videoToBarsCmdChunks = [
	':force_original_aspect_ratio=decrease,pad=',
	'[vid];[vid][1:v]overlay'
]

export const videoToBars = filterData => {
	const { renderWidth, renderHeight } = filterData

	return `[0:v]scale=${renderWidth}:${renderHeight}${videoToBarsCmdChunks[0]}${renderWidth}:${renderHeight}${videoToBarsCmdChunks[1]}`
}
