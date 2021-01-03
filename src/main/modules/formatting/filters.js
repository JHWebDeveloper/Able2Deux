const getBGLayerNumber = (sourceData, overlayDim) => {
	if (sourceData) {
		return overlayDim ? 4 : 2
	} else {
		return overlayDim ? 3 : 1
	}
}

/**
	Storing larger chunks of command strings in variables outside of their
	respective functions. Dev acknowledges the readability hit, but preview
	speed is so crucial to app, performance is favored here.
	*/

const shortestAndFormat = ':shortest=1:format=auto'
const sourceDataCmd = '[tosrc];[tosrc][1:v]overlay'
const previewResize = 'scale=w=384:h=216:force_original_aspect_ratio=decrease'
const previewMixdown = `[final];[final]${previewResize}`

const overlayDimCmdChunks = [
	'[tooverlay];[tooverlay]scale=w=',
	':force_original_aspect_ratio=increase[scaled];[',
	':v][scaled]overlay=(main_w-overlay_w)/2:',
	':shortest=1[positioned];[positioned]['
]

const finalize = ({ filter, sourceData, overlayDim, isPreview }) => {
	if (sourceData) filter = `${filter}${sourceDataCmd}`
	if (overlayDim) filter = `${filter}${overlayDimCmdChunks[0]}${overlayDim.width}:h=${overlayDim.height}${overlayDimCmdChunks[1]}${sourceData ? 2 : 1}${overlayDimCmdChunks[2]}${overlayDim.y}${overlayDimCmdChunks[3]}${sourceData ? 3 : 2}:v]overlay`
	if (isPreview) filter = `${filter}${previewMixdown}`

	return filter
}

const noneCmdLargeChunk = '[vid];[vid][1:v]overlay'

export const none = (filterData, isPreview) => {
	const { angle, sourceData, reflect, renderWidth, renderHeight } = filterData

	let filter = `${reflect}${angle}`

	if (sourceData || isPreview) filter = `[0:v]${filter}`
	if (sourceData) filter = `${filter}scale=w=${renderWidth}:h=${renderHeight}${noneCmdLargeChunk}`

	if (sourceData && isPreview) {
		filter = `${filter}${previewMixdown}`
	} else if (isPreview) {
		filter = `${filter}${previewResize}`
	}

	return filter ? filter.replace(/,$/, '') : 'nullsink'
}

const fillCmdChunks = [
	':force_original_aspect_ratio=increase,crop=',
	'*(iw-ow)/2:(ih-oh)/2+',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fill = (filterData, isPreview) => {
	let { sourceData, overlayDim, centering, angle, reflect, renderWidth, renderHeight, hasAlpha } = filterData

	centering /= -100

	let filter = `[0:v]${reflect}${angle}scale=w=${renderWidth}:h=${renderHeight}${fillCmdChunks[0]}${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}${fillCmdChunks[1]}${centering}*(ih-oh)/2`

	if (hasAlpha) {
		filter = `${filter}[fg];[${getBGLayerNumber(sourceData, overlayDim)}${fillCmdChunks[2]}${shortestAndFormat}`
	}

	return finalize({ filter, sourceData, overlayDim, isPreview })
}

const fitCmdChunks = [
	':force_original_aspect_ratio=decrease[fg];',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fit = (filterData, isPreview) => {
	const { sourceData, overlayDim, angle, reflect, renderWidth, renderHeight } = filterData

	const filter = [
		`[0:v]${reflect}${angle}scale=w=${renderWidth}:h=${renderHeight}${fitCmdChunks[0]}`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${fitCmdChunks[1]}${shortestAndFormat}`
	].join('')

	return finalize({ filter, sourceData, overlayDim, isPreview })
}

const transformCmdChunks = [
	':v][fg]overlay=(main_w-overlay_w)/2+',
	'*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+',
	'*(main_h/2+overlay_h/2)'
]

const offsetCmdChunks = [
	',rotate=\'',
	'*PI/180:ow=hypot(iw,ih):oh=ow:oh=ow:c=none\''
]

export const transform = (filterData, isPreview) => {
	const { crop, scale, position, angle, offset, reflect, sourceData, overlayDim } = filterData

	const cropH = (crop.b - crop.t) / 100
	const cropW = (crop.r - crop.l) / 100

	crop.t /= 100
	crop.l /= 100
	scale.x /= 100
	scale.y /= 100
	position.x /= 100
	position.y /= 100

	const filter = [
		`[0:v]${reflect}${angle}crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}*ih:exact=1,scale=w=${scale.x || 0.005}*iw:h=${scale.y || 0.005}*ih${offset === 0 ? '' : offsetCmdChunks.join(offset)}[fg];`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${transformCmdChunks[0]}${position.x}${transformCmdChunks[1]}${position.y}${transformCmdChunks[2]}${shortestAndFormat}`
	].join('')

	return finalize({ filter, sourceData, overlayDim, isPreview })
}

const videoToBarsCmdChunks = [
	':force_original_aspect_ratio=decrease,pad=',
	'[vid];[vid][1:v]overlay'
]

export const videoToBars = filterData => {
	const { renderWidth, renderHeight } = filterData

	return `[0:v]scale=${renderWidth}:${renderHeight}${videoToBarsCmdChunks[0]}${renderWidth}:${renderHeight}${videoToBarsCmdChunks[1]}`
}
