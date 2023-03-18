export * from './fillFilter'
export * from './fitFilter'
export * from './noneFilter'
export * from './transformFilter'
export * from './videoToBarsFilter'

// ---- SHARED COMMAND CONSTANTS --------

export const shortestAndFormat = ':shortest=1:format=auto'

const overlayDimCmdChunks = [
	'[tooverlay];[tooverlay]scale=w=',
	':force_original_aspect_ratio=increase[scaled];[',
	':v][scaled]overlay=(main_w-overlay_w)/2:',
	':shortest=1[positioned];[positioned]['
]

// ---- SHARED COMMAND GENERATING FUNCTIONS --------

export const buildKeyFilter = (isPreview, keying) => {
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
	`curves=m='${normalizeCurve(rgb)}':r='${normalizeCurve(r)}':g='${normalizeCurve(g)}':b='${normalizeCurve(b)}'[cc];[cc]`
)

export const buildCommonFilter = (isPreview, rotation, curves) => {
	const { reflect, transpose } = rotation
	let filter = 'null'

	if (reflect && transpose) {
		filter = `${reflect},${transpose}`
	} else if (reflect) {
		filter = reflect
	} else if (transpose) {
		filter = transpose
	}

	if (curves.enabled && !(isPreview && curves.hidden)) filter = `${buildCurvesFilter(curves)}${filter}`

	return filter
}

export const getBGLayerNumber = (sourceData, overlayDim) => {
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

export const previewResize = (() => {
	const cmdChunks = ':force_original_aspect_ratio=decrease'

	return ({ width, height }) => `scale=w=${width}:h=${height}${cmdChunks}`
})()

export const previewMixdown = size => `[final];[final]${previewResize(size)}`

export const finalize = ({ filter, sourceData, overlayDim, isPreview, previewSize }) => {
	if (sourceData) filter = `${filter}${buildSrcLayer(sourceData)}`
	if (overlayDim) filter = `${filter}${overlayDimCmdChunks[0]}${overlayDim.width}:h=${overlayDim.height}${overlayDimCmdChunks[1]}${sourceData ? 2 : 1}${overlayDimCmdChunks[2]}${overlayDim.y}${overlayDimCmdChunks[3]}${sourceData ? 3 : 2}:v]overlay`
	if (isPreview) filter = `${filter}${previewMixdown(previewSize)}`

	return filter
}
