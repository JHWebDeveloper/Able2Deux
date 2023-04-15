import {
	buildCommonFilter,
	previewMixdown,
	previewResize
} from '.'

const cmdChunks = '[vid];[vid][1:v]overlay'

export const none = (filterData, isPreview, previewSize) => {
	const { rotation, colorCurves, sourceData, renderWidth, renderHeight } = filterData

	let filter = buildCommonFilter(isPreview, rotation, colorCurves)

	if (sourceData || isPreview) filter = `[0:v]${filter}`
	if (sourceData) filter = `${filter},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks}`
	if (isPreview) filter = [filter, previewMixdown(previewSize)].join(sourceData ? '' : ',')

	return filter ? filter : 'nullsink'
}
