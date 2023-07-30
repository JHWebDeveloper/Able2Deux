import { objectPick } from 'utilities'

// ---- LOCAL CONSTANTS --------

const COLOR_CORRECTION_PROPS = ['ccEnabled', 'ccHidden', 'ccRGB', 'ccR', 'ccG', 'ccB']

const CROP_PROPS = ['cropT', 'cropR', 'cropB', 'cropL']

const CROP_LINK_PROPS = ['cropLinkTB', 'cropLinkLR']

const FRAMING_PROPS = ['arc', 'background', 'bgColor', 'overlay']

const KEYING_PROPS = [
	'keyingEnabled',
	'keyingHidden',
	'keyingType',
	'keyingColor',
	'keyingSimilarity',
	'keyingBlend',
	'keyingThreshold',
	'keyingTolerance',
	'keyingSoftness'
]

const ROTATION_PROPS = ['transpose', 'reflect', 'freeRotateMode', 'angle', 'rotatedCentering']

const SCALE_PROPS = ['scaleX', 'scaleY']

const SOURCE_PROPS = ['sourceName', 'sourcePrefix', 'sourceOnTop']

/* dyanmicProps are props that can be copied from one media item to another
    and should cause a preview render on change */
const DYNAMIC_PROPS = [
	...FRAMING_PROPS,
	...SCALE_PROPS,
	...CROP_PROPS,
	...ROTATION_PROPS,
	...KEYING_PROPS,
	...COLOR_CORRECTION_PROPS,
	...SOURCE_PROPS,
	'audioVideoTracks',
	'audioExportFormat',
	'centering',
	'positionX',
	'positionY'
]

// ---- OBJECT PICKERS --------

const createObjectPicker = keys => props => objectPick(props, keys)

export const extractCopyPasteProps = createObjectPicker([
	...DYNAMIC_PROPS,
	...CROP_LINK_PROPS,
	'backgroundMotion',
	'scaleLink',
	'ccSelectedCurve'
])

export const extractPreviewRenderDependencies = (() => {
	const omitNonVisiualProps = createObjectPicker([
		...DYNAMIC_PROPS,
		'id',
		'timecode'
	])

	return props => Object.values(omitNonVisiualProps(props))
})()


export const extractColorCorrectionProps = createObjectPicker([...COLOR_CORRECTION_PROPS, 'ccSelectedCurve'])

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

export const extractFramingProps = createObjectPicker([...FRAMING_PROPS, 'backgroundMotion'])

export const extractKeyingProps = createObjectPicker(KEYING_PROPS)

export const extractRotationProps = createObjectPicker(ROTATION_PROPS)

export const extractScaleProps = createObjectPicker([...SCALE_PROPS, 'scaleLink'])

export const extractSourceProps = createObjectPicker(SOURCE_PROPS)
