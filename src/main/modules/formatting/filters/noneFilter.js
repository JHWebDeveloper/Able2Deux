import {
  buildCommonFilter,
  previewMixdown,
  previewResize
} from './shared'

const cmdChunks = '[vid];[vid][1:v]overlay'

export const none = (filterData, isPreview, previewSize) => {
  const { rotation, colorCurves, sourceData, renderWidth, renderHeight } = filterData

  let filter = buildCommonFilter(isPreview, rotation, colorCurves)

  if (sourceData || isPreview) filter = `[0:v]${filter}`
  if (sourceData) filter = `${filter},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks}`

  if (sourceData && isPreview) {
    filter = `${filter}${previewMixdown(previewSize)}`
  } else if (isPreview) {
    filter = `${filter},${previewResize(previewSize)}`
  }

  return filter ? filter : 'nullsink'
}
