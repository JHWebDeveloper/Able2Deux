const backgroundCmd = (sourceData, overlayDim) => `[${sourceData ? (overlayDim ? 4 : 2) : (overlayDim ? 3 : 1)}:v]loop=loop=-1:size=419.58042:start=0[bg];`
const sourceCmd = sourceData => !sourceData ? '' : '[tosrc];[tosrc][1:v]overlay'
const overlayCmd = (overlayDim, sourceData) => !overlayDim ? '' : `[tooverlay];[tooverlay]scale=w=${overlayDim.width}:h=${overlayDim.height}:force_original_aspect_ratio=increase[scaled];[${sourceData ? 2 : 1}:v][scaled]overlay=(main_w-overlay_w)/2:${overlayDim.y}:shortest=1[positioned];[positioned][${sourceData ? 3 : 2}:v]overlay`
const finalCmd = isPreview => isPreview ? '[final];[final]scale=w=384:h=216:force_original_aspect_ratio=decrease' : ''

export const none = (command, filterData, isPreview) => {
	const { angle, sourceData, reflect, renderWidth, renderHeight } = filterData

	const filter = [
		sourceData || isPreview ? '[0:v]' : '',
		angle,
		reflect,
		!sourceData ? '' : `scale=w=${renderWidth}:h=${renderHeight}[vid];[vid][1:v]overlay`,
		!isPreview ? '' : `${sourceData ? '[final];[final]' : ''}scale=w=384:h=216:force_original_aspect_ratio=decrease`
	].join('')

	if (filter) command.complexFilter(filter.replace(/,$/, ''))
}

export const fill = (command, filterData, isPreview) => {
	let { centering, angle, reflect, renderWidth, renderHeight, sourceData, overlayDim } = filterData

	centering /= -100

	command.complexFilter([
		`[0:v]${angle}${reflect}scale=w=${renderWidth}:h=${renderHeight}:force_original_aspect_ratio=increase,crop=${renderWidth}:${renderHeight}:(iw-ow)/2+${centering}*(iw-ow)/2:(ih-oh)/2+${centering}*(ih-oh)/2`,
		sourceCmd(sourceData),
		overlayCmd(overlayDim, sourceData),
		finalCmd(isPreview)
	].join(''))

	
}

export const fit = (command, background, filterData, isPreview) => {
	const { sourceData, overlayDim, angle, reflect, renderWidth, renderHeight } = filterData

	command
		.input(background)
		.complexFilter([
			backgroundCmd(sourceData, overlayDim),
			`[0:v]${angle}${reflect}scale=w=${renderWidth}:h=${renderHeight}:force_original_aspect_ratio=decrease[fg];`,
			'[bg][fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1',
			sourceCmd(sourceData),
			overlayCmd(overlayDim, sourceData),
			finalCmd(isPreview)
		].join(''))
}

export const transform = (command, background, filterData, isPreview) => {
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

	command
		.input(background)
		.complexFilter([
			backgroundCmd(sourceData, overlayDim),
			`[0:v]${angle}${reflect}crop=${cropW}*iw:${cropH}*ih:${crop.l}*iw:${crop.t}*ih,scale=w=${scale.x || 0.005}*iw:h=${scale.y || 0.005}*ih[fg];`,
			`[bg][fg]overlay=(main_w-overlay_w)/2+${position.x}*(main_w/2+overlay_w/2):(main_h-overlay_h)/2+${position.y}*(main_h/2+overlay_h/2):shortest=1`,
			sourceCmd(sourceData),
			overlayCmd(overlayDim, sourceData),
			finalCmd(isPreview)
		].join(''))
}
