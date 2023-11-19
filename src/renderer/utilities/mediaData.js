import { v1 as uuid } from 'uuid'

import { DEFAULT_MEDIA_STATE } from 'constants'

const { interop } = window.ABLE2

export const createCurvePoint = (x, y, limit = false) => ({
	id: uuid(),
	hidden: false,
	limit,
	x,
	y
})

export const createDefaultCurvePoints = () => [
	createCurvePoint(0, 256, true),
	createCurvePoint(256, 0, true)
]

export const createMediaData = async params => {
	const { editorSettings } = await interop.requestPrefs()

	params.id = params.id || uuid()
	params.refId = params.id

	if (editorSettings.backgroundMotion === 'auto') {
		editorSettings.backgroundMotion = params.mediaType === 'image' ? 'still' : 'animated'
	}

	return {
		...DEFAULT_MEDIA_STATE,
		ccRGB: createDefaultCurvePoints(),
		ccR: createDefaultCurvePoints(),
		ccG: createDefaultCurvePoints(),
		ccB: createDefaultCurvePoints(),
		...editorSettings,
		...params
	}
}
