import {
	buildCommonFilter,
	buildKeyFilter,
	finalize,
	getBGLayerNumber,
	shortestAndFormat
} from '.'

import { freeRotateFilter } from './freeRotateFilter'

const cmdChunks = [
	'*ih:exact=1',
	':v][fg]overlay=(main_w-overlay_w)/2+',
	'*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+',
	'*(main_h/2+overlay_h/2)'
]

export const transform = (filterData, isPreview, previewSize) => {
	const { crop, scale, position, keying, rotation, colorCurves, width, height, sourceData, overlayDim } = filterData
	const { angle } = rotation

	const cropW = (crop.r - crop.l) / 100
	const cropH = (crop.b - crop.t) / 100

	crop.t /= 100
	crop.l /= 100
	scale.x /= 100
	scale.y /= 100
	position.x /= 100
	position.y /= 100

	const filter = [
		`[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, rotation, colorCurves)},scale=${scale.x || 0.005}*iw:${scale.y || 0.005}*ih,crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}${cmdChunks[0]}${angle === 0 ? '' : freeRotateFilter(rotation, width * scale.x * cropW, height * scale.y * cropH)}[fg];`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${cmdChunks[1]}${position.x}${cmdChunks[2]}${position.y}${cmdChunks[3]}${shortestAndFormat}`
	].join('')

	return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
}
