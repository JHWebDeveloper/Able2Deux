import {
  buildCommonFilter,
  buildKeyFilter,
  finalize,
  getBGLayerNumber,
  shortestAndFormat
} from './shared'

const cmdChunks = [
  ':force_original_aspect_ratio=increase,crop=',
  '*(iw-ow)/2:(ih-oh)/2+',
  ':v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
]

export const fill = (filterData, isPreview, previewSize) => {
  const { keying, rotation, colorCurves, sourceData, overlayDim, renderWidth, renderHeight, hasAlpha } = filterData
  let { centering } = filterData

  centering /= -100

  let filter = `[0:v]${buildKeyFilter(isPreview, keying)}${buildCommonFilter(isPreview, rotation, colorCurves)},scale=w=${renderWidth}:h=${renderHeight}${cmdChunks[0]}${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}${cmdChunks[1]}${centering}*(ih-oh)/2`

  if (hasAlpha || keying.enabled) {
    filter = `${filter}[fg];[${getBGLayerNumber(sourceData, overlayDim)}${cmdChunks[2]}${shortestAndFormat}`
  }

  return finalize({ filter, sourceData, overlayDim, isPreview, previewSize })
}
