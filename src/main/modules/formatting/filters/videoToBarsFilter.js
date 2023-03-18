const cmdChunks = [
	':force_original_aspect_ratio=decrease,pad=',
	'[vid];[vid][1:v]overlay'
]

export const videoToBars = filterData => {
	const { renderWidth, renderHeight } = filterData

	return `[0:v]scale=${renderWidth}:${renderHeight}${cmdChunks[0]}${renderWidth}:${renderHeight}${cmdChunks[1]}`
}
