const getBGLayerNumber = (sourceData, overlayDim) => sourceData ? (overlayDim ? 4 : 2) : (overlayDim ? 3 : 1)
const overlayCmd = (overlayDim, sourceData) => `[tooverlay];[tooverlay]scale=w=${overlayDim.width}:h=${overlayDim.height}:force_original_aspect_ratio=increase[scaled];[${sourceData ? 2 : 1}:v][scaled]overlay=(main_w-overlay_w)/2:${overlayDim.y}:shortest=1[positioned];[positioned][${sourceData ? 3 : 2}:v]overlay`
const sourceCmd = '[tosrc];[tosrc][1:v]overlay'
const previewCmd = '[final];[final]scale=w=384:h=216:force_original_aspect_ratio=decrease'

export const none = (filterData, isPreview) => {
	const { angle, sourceData, reflect, renderWidth, renderHeight } = filterData

	let filter = [angle, reflect]

	if (sourceData || isPreview) filter.unshift('[0:v]')
	if (sourceData) filter.push(`scale=w=${renderWidth}:h=${renderHeight}[vid];[vid][1:v]overlay`)

	if (sourceData && isPreview) {
		filter.push(previewCmd)
	} else if (isPreview) {
		filter.push('scale=w=384:h=216:force_original_aspect_ratio=decrease')
	}

	filter = filter.join('').replace(/,$/, '')

	return filter || 'nullsink'
}

export const fill = (filterData, isPreview) => {
	let { sourceData, overlayDim, centering, angle, reflect, renderWidth, renderHeight, hasAlpha } = filterData

	centering /= -100

	let filter = [
		`[0:v]${angle}${reflect}scale=w=${renderWidth}:h=${renderHeight}:force_original_aspect_ratio=increase,crop=${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}*(iw-ow)/2:(ih-oh)/2+${centering}*(ih-oh)/2`
	]

	if (hasAlpha) {
		filter.push(`[fg];[${getBGLayerNumber(sourceData, overlayDim)}:v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1`)
	}

	if (sourceData) filter.push(sourceCmd)
	if (overlayDim) filter.push(overlayCmd(overlayDim, sourceData))
	if (isPreview) filter.push(previewCmd)

	return filter.join('')
}

export const fit = (filterData, isPreview) => {
	const { sourceData, overlayDim, angle, reflect, renderWidth, renderHeight } = filterData

	const filter = [
		`[0:v]${angle}${reflect}scale=w=${renderWidth}:h=${renderHeight}:force_original_aspect_ratio=decrease[fg];`,
		`[${getBGLayerNumber(sourceData, overlayDim)}:v][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1`
	]

	if (sourceData) filter.push(sourceCmd)
	if (overlayDim) filter.push(overlayCmd(overlayDim, sourceData))
	if (isPreview) filter.push(previewCmd)

	return filter.join('')
}

export const transform = (filterData, isPreview) => {
	const { crop, scale, position, angle, reflect, sourceData, overlayDim } = filterData

	crop.t /= 100
	crop.b /= 100
	crop.l /= 100
	crop.r /= 100
	scale.x /= 100
	scale.y /= 100
	position.x /= 100
	position.y /= 100

	const cropH = Math.max(1 - (crop.t + crop.b), 0.01)
	const cropW = Math.max(1 - (crop.l + crop.r), 0.01)

	const filter = [
		`[0:v]${angle}${reflect}crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}*ih,scale=w=${scale.x || 0.005}*iw:h=${scale.y || 0.005}*ih[fg];`,
		`[${getBGLayerNumber(sourceData, overlayDim)}:v][fg]overlay=(main_w-overlay_w)/2+${position.x}*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+${position.y}*(main_h/2+overlay_h/2):shortest=1`
	]

	if (sourceData) filter.push(sourceCmd)
	if (overlayDim) filter.push(overlayCmd(overlayDim, sourceData))
	if (isPreview) filter.push(previewCmd)

	return filter.join('')
}

export const videoToBars = filterData => {
	const { renderWidth, renderHeight } = filterData

	return `[0:v]scale=${renderWidth}:${renderHeight}:force_original_aspect_ratio=decrease,pad=${renderWidth}:${renderHeight}[vid];[vid][1:v]overlay`
}
