import {
	buildAnamorphicFilter,
	buildCommonFilter,
	buildKeyFilter,
	finalize,
	getBGLayerNumber,
	shortestAndFormat
} from '.'

const cmdChunks = [
	':force_original_aspect_ratio=decrease[fg];[',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fit = (filterData, isPreview, previewSize) => {
	const { keying, rotation, colorCurves, sourceData, renderWidth, renderHeight } = filterData

	const anamorphicFilter = buildAnamorphicFilter(filterData.isAnamorphic)
	const keyFilter = buildKeyFilter(isPreview, keying)
	const commonFilter = buildCommonFilter(isPreview, rotation, colorCurves)
	const filter = `[0:v]${anamorphicFilter}${keyFilter}${commonFilter},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks[0]}${getBGLayerNumber(sourceData)}${cmdChunks[1]}${shortestAndFormat}`

	return finalize({ filter, sourceData, isPreview, previewSize })
}
