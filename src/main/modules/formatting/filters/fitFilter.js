import {
	buildCommonFilter,
	buildKeyFilter,
	finalize,
	getBGLayerNumber,
	shortestAndFormat
} from '.'

const cmdChunks = [
	':force_original_aspect_ratio=decrease[fg];',
	':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fit = (filterData, isPreview, previewSize) => {
	const { keying, rotation, colorCurves, sourceData, overlayDim, renderWidth, renderHeight } = filterData

	const filter = [
		`[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, rotation, colorCurves)},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks[0]}`,
		`[${getBGLayerNumber(sourceData, overlayDim)}${cmdChunks[1]}${shortestAndFormat}`
	].join('')

	return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
}
