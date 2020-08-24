const getOverlayInnerDimensions = (size, overlay) => {
	const is1080 = size === '1080'

	return {
		tv: {
			width: is1080 ? 1576 : 1050,
			height: is1080 ? 886 : 590,
			y: is1080 ? 78 : 52
		},
		laptop: {
			width: is1080 ? 1366 : 912,
			height: is1080 ? 778 : 518,
			y: is1080 ? 86 : 58
		}
	}[overlay]
}

export default getOverlayInnerDimensions
