export * from './fillFilter'
export * from './fitFilter'
export * from './noneFilter'
export * from './transformFilter'

export const shortestAndFormat = ':shortest=1:format=auto'

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

export const getBGLayerNumber = sourceData => sourceData ? 2 : 1

export const previewResize = (() => {
	const cmdChunks = ':force_original_aspect_ratio=decrease'

	return ({ width, height }) => `scale=w=${width}:h=${height}${cmdChunks}`
})()

export const previewMixdown = size => `[final];[final]${previewResize(size)}`

export const finalize = (() => {
	const cmdChunks = [
		'[tosrc];[tosrc][1:v]overlay'
	]

	return ({ filter, sourceData, isPreview, previewSize }) => {
		if (sourceData) filter = `${filter}${cmdChunks[0]}`
		if (isPreview) filter = `${filter}${previewMixdown(previewSize)}`

		return filter
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
