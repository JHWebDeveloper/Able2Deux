import { objectPick } from 'utilities'

// ---- CONSTANTS --------

export const CROP_PROPS = Object.freeze(['cropT', 'cropL', 'cropB', 'cropR'])

const AUDIO_PROPS = Object.freeze(['audioVideoTracks', 'audioExportFormat'])
const COLOR_CORRECTION_PROPS = Object.freeze(['ccEnabled', 'ccRGB', 'ccR', 'ccG', 'ccB'])
const CROP_LINK_PROPS = Object.freeze(['cropLinkTB', 'cropLinkLR'])
const FRAMING_PROPS = Object.freeze(['arc', 'background', 'bgColor', 'backgroundMotion', 'overlay'])
const KEYING_PROPS = Object.freeze(['keyingEnabled', 'keyingType', 'keyingColor'])
const CHROMA_KEY_PROPS = Object.freeze(['keyingSimilarity', 'keyingBlend'])
const LUMA_KEY_PROPS = Object.freeze(['keyingThreshold', 'keyingTolerance', 'keyingSoftness'])
const POSITION_PROPS = Object.freeze(['positionX', 'positionY'])
const ROTATION_BASIC_PROPS = Object.freeze(['transpose', 'reflect'])
const ROTATION_ADVANCED_PROPS = Object.freeze(['freeRotateMode', 'angle', 'rotatedCentering'])
const SCALE_PROPS = Object.freeze(['scaleX', 'scaleY'])
const SOURCE_PROPS = Object.freeze(['sourceName', 'sourcePrefix', 'sourceOnTop'])

// ---- OBJECT PICKERS --------

export const createObjectPicker = keys => props => objectPick(props, keys)

export const extractAudioProps = createObjectPicker(AUDIO_PROPS)

export const extractPreviewRenderDependencies = (() => {
	const getVisualProps = createObjectPicker([
		...AUDIO_PROPS,
		...FRAMING_PROPS,
		...SCALE_PROPS,
		...CROP_PROPS,
		...ROTATION_BASIC_PROPS,
		...ROTATION_ADVANCED_PROPS,
		...KEYING_PROPS,
		...CHROMA_KEY_PROPS,
		...LUMA_KEY_PROPS,
		...COLOR_CORRECTION_PROPS,
		...SOURCE_PROPS,
		...POSITION_PROPS,
		'centering',
		'keyingHidden',
		'ccHidden',
		'id',
		'timecode'
	])

	return props => Object.values(getVisualProps(props))
})()

export const extractCenteringProps = createObjectPicker(['centering'])

export const extractColorCorrectionProps = createObjectPicker(COLOR_CORRECTION_PROPS)

export const extractCommonPanelProps = createObjectPicker([
	'id',
	'multipleItems',
	'multipleItemsSelected',
	'allItemsSelected',
	'mediaType',
	'width',
	'height',
	'aspectRatio',
	'copyToClipboard',
	'dispatch'
])

export const extractCropProps = createObjectPicker([...CROP_PROPS, ...CROP_LINK_PROPS])

export const extractDefaultPrefs = createObjectPicker([
	'saveLocations',
	'split',
	'optimize',
	'timerEnabled',
	'timer',
	'screenshot',
	'previewQuality',
	'previewHeight',
	'aspectRatioMarkers'
])

export const extractFramingProps = createObjectPicker(FRAMING_PROPS)

export const extractKeyingProps = createObjectPicker([...KEYING_PROPS, ...CHROMA_KEY_PROPS, ...LUMA_KEY_PROPS])

export const extractPositionProps = createObjectPicker(POSITION_PROPS)

export const extractRotationProps = createObjectPicker([...ROTATION_BASIC_PROPS, ...ROTATION_ADVANCED_PROPS])

export const extractScaleProps = createObjectPicker([...SCALE_PROPS, 'scaleLink'])

export const extractSourceProps = createObjectPicker(SOURCE_PROPS)

export const extractRelevantMediaProps = media => {
	const { mediaType, arc } = media
	
	if (mediaType === 'audio') {
		return objectPick(media, ['audioExportFormat'])
	} else if (media.audioVideoTracks === 'audio') {
		return objectPick(media, AUDIO_PROPS)
	}

	const commonProps = [
		...FRAMING_PROPS,
		...COLOR_CORRECTION_PROPS,
		...ROTATION_BASIC_PROPS
	]

	if (mediaType === 'video' && media.hasAudio) {
		commonProps.push(...AUDIO_PROPS)
	}

	if (arc !== 'none' && media.keyingType === 'luma') {
		commonProps.push(...KEYING_PROPS, ...LUMA_KEY_PROPS)
	} else if (arc !== 'none') {
		commonProps.push(...KEYING_PROPS, ...CHROMA_KEY_PROPS)
	}

	if (!(arc === 'none' && media.aspectRatio !== '16:9')) {
		commonProps.push(...SOURCE_PROPS)
	}
	
	if (arc === 'fill') {
		return objectPick(media, [...commonProps, 'centering'])
	} else if (arc === 'transform') {
		return objectPick(media, [
			...commonProps,
			...POSITION_PROPS,
			...SCALE_PROPS,
			...CROP_PROPS,
			...CROP_LINK_PROPS,
			...ROTATION_ADVANCED_PROPS,
			'scaleLink'
		])
	}
	
	return objectPick(media, commonProps)
}
