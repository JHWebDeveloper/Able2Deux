import {
	buildAnamorphicFilter,
	buildCommonFilter,
	buildKeyFilter,
	finalize,
	getBGLayerNumber,
	shortestAndFormat
} from '.'

const cmdChunks = [
	':force_original_aspect_ratio=increase,crop=',
	'*(iw-ow)/2:(ih-oh)/2+',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fill = (filterData, isPreview, previewSize) => {
	const { keying, rotation, colorCurves, sourceData, renderWidth, renderHeight, hasAlpha } = filterData
	let { centering } = filterData

	centering /= -100

	const anamorphicFilter = buildAnamorphicFilter(filterData.isAnamorphic)
	const keyFilter = buildKeyFilter(isPreview, keying)
	const commonFilter = buildCommonFilter(isPreview, rotation, colorCurves)
	let filter = `[0:v]${anamorphicFilter}${keyFilter}${commonFilter},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks[0]}${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}${cmdChunks[1]}${centering}*(ih-oh)/2`

	if (hasAlpha || keying.enabled) {
		filter = `${filter}[fg];[${getBGLayerNumber(sourceData)}${cmdChunks[2]}${shortestAndFormat}`
	}

	return finalize({ filter, sourceData, isPreview, previewSize })
}
