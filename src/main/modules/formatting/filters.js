// eslint-disable-next-line no-extra-parens
const getBGLayerNumber = (sourceData, overlayDim) => sourceData ? (overlayDim ? 4 : 2) : (overlayDim ? 3 : 1)
const previewResize = 'scale=w=384:h=216:force_original_aspect_ratio=decrease'
const previewMixdown = `[final];[final]${previewResize}`
const sourceDataCmd = '[tosrc];[tosrc][1:v]overlay'

const overlayDimCmdLargeChunks = [
	'[tooverlay];[tooverlay]scale=w=',
	':force_original_aspect_ratio=increase[scaled];[',
	':v][scaled]overlay=(main_w-overlay_w)/2:',
	':shortest=1[positioned];[positioned]['
]

const addLayers = (filter, sourceData, overlayDim, isPreview) => {
	if (sourceData) filter = `${filter}${sourceDataCmd}`
	if (overlayDim) filter = `${filter}${overlayDimCmdLargeChunks[0]}${overlayDim.width}:h=${overlayDim.height}${overlayDimCmdLargeChunks[1]}${sourceData ? 2 : 1}${overlayDimCmdLargeChunks[2]}${overlayDim.y}${overlayDimCmdLargeChunks[3]}${sourceData ? 3 : 2}:v]overlay`
	if (isPreview) filter = `${filter}${previewMixdown}`

	return filter
}

const noneCmdLargeChunk = '[vid];[vid][1:v]overlay'

export const none = (filterData, isPreview) => {
	const { angle, sourceData, reflect, renderWidth, renderHeight } = filterData

	let filter = `${angle}${reflect}`

	if (sourceData || isPreview) filter = `[0:v]${filter}`
	if (sourceData) filter = `${filter}scale=w=${renderWidth}:h=${renderHeight}${noneCmdLargeChunk}`

	if (sourceData && isPreview) {
		filter = `${filter}${previewMixdown}`
	} else if (isPreview) {
		filter = `${filter}${previewResize}`
	}

	return filter ? filter.replace(/,$/, '') : 'nullsink'
}

const fillCmdLargeChunks = [
	':force_original_aspect_ratio=increase,crop=',
	'*(iw-ow)/2:(ih-oh)/2+',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1'
]

export const fill = (filterData, isPreview) => {
	let { sourceData, overlayDim, centering, angle, reflect, renderWidth, renderHeight, hasAlpha } = filterData

	centering /= -100

	let filter = `[0:v]${angle}${reflect}scale=w=${renderWidth}:h=${renderHeight}${fillCmdLargeChunks[0]}${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}${fillCmdLargeChunks[1]}${centering}*(ih-oh)/2`

	if (hasAlpha) {
		filter = `${filter}[fg];[${getBGLayerNumber(sourceData, overlayDim)}${fillCmdLargeChunks[2]}`
	}

	return addLayers(filter, sourceData, overlayDim, isPreview)
}

const fitCmdLargeChunks = [
	':force_original_aspect_ratio=decrease[fg];',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1'
]

export const fit = (filterData, isPreview) => {
	const { sourceData, overlayDim, angle, reflect, renderWidth, renderHeight } = filterData

	const filter = [
		`[0:v]${angle}${reflect}scale=w=${renderWidth}:h=${renderHeight}${fitCmdLargeChunks[0]}`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${fitCmdLargeChunks[1]}`
	].join('')

	return addLayers(filter, sourceData, overlayDim, isPreview)
}

const transformCmdLargeChunks = [
	':v][fg]overlay=(main_w-overlay_w)/2+',
	'*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+',
	'*(main_h/2+overlay_h/2):shortest=1'
]

export const transform = (filterData, isPreview) => {
	const { crop, scale, position, angle, reflect, sourceData, overlayDim } = filterData

	const cropH = (crop.b - crop.t) / 100
	const cropW = (crop.r - crop.l) / 100

	crop.t /= 100
	crop.l /= 100
	scale.x /= 100
	scale.y /= 100
	position.x /= 100
	position.y /= 100

	const filter = [
		`[0:v]${angle}${reflect}crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}*ih,scale=w=${scale.x || 0.005}*iw:h=${scale.y || 0.005}*ih[fg];`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${transformCmdLargeChunks[0]}${position.x}${transformCmdLargeChunks[1]}${position.y}${transformCmdLargeChunks[2]}`
	].join('')

	return addLayers(filter, sourceData, overlayDim, isPreview)
}

const videoToBarsCmdLargeChunks = [
	':force_original_aspect_ratio=decrease,pad=',
	'[vid];[vid][1:v]overlay'
]

export const videoToBars = filterData => {
	const { renderWidth, renderHeight } = filterData

	return `[0:v]scale=${renderWidth}:${renderHeight}${videoToBarsCmdLargeChunks[0]}${renderWidth}:${renderHeight}${videoToBarsCmdLargeChunks[1]}`
}
