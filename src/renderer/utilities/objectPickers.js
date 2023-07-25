import { objectPick } from 'utilities'

const createObjectPicker = keys => props => objectPick(props, keys)

const colorCorrectionProps = ['ccEnabled', 'ccHidden', 'ccRGB', 'ccR', 'ccG', 'ccB']

const cropProps = ['cropT', 'cropR', 'cropB', 'cropL']

const cropLinkProps = ['cropLinkTB', 'cropLinkLR']

const framingProps = ['arc', 'background', 'bgColor', 'overlay']

const keyingProps = [
	'keyingEnabled',
	'keyingHidden',
	'keyingType',
	'keyingColor',
	'keyingSimilarity',
	'keyingBlend',
	'keyingThreshold',
	'keyingTolerance',
	'keyingSoftness',
]

const rotationProps = ['transpose', 'reflect', 'freeRotateMode', 'angle', 'rotatedCentering']

const scaleProps = ['scaleX', 'scaleY']

const sourceProps = ['sourceName', 'sourcePrefix', 'sourceOnTop']

/* dyanmicProps are props that can be copied from one media item to another
    and should cause a preview render on change */
const dynamicProps = [
	...framingProps,
	...scaleProps,
	...cropProps,
	...rotationProps,
	...keyingProps,
	...colorCorrectionProps,
	...sourceProps,
	'audioVideoTracks',
	'audioExportFormat',
	'centering',
	'positionX',
	'positionY'
]

export const extractCopyPasteProps = createObjectPicker([
	...dynamicProps,
	...cropLinkProps,
	'backgroundMotion',
	'scaleLink',
	'ccSelectedCurve'
])

export const extractPreviewRenderDependencies = (() => {
	const omitNonVisiualProps = createObjectPicker([
		...dynamicProps,
		'id',
		'timecode'
	])

	return props => Object.values(omitNonVisiualProps(props))
})()


export const extractColorCorrectionProps = createObjectPicker([...colorCorrectionProps, 'ccSelectedCurve'])

export const extractCommonPanelProps = createObjectPicker([
	'id',
	'multipleItems',
	'multipleItemsSelected',
	'allItemsSelected',
	'mediaType',
	'width',
	'height',
	'aspectRatio',
	'dispatch'
])

export const extractCropProps = createObjectPicker([...cropProps, ...cropLinkProps])

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

export const extractFramingProps = createObjectPicker([...framingProps, 'backgroundMotion'])

export const extractKeyingProps = createObjectPicker(keyingProps)

export const extractRotationProps = createObjectPicker(rotationProps)

export const extractScaleProps = createObjectPicker([...scaleProps, 'scaleLink'])

export const extractSourceProps = createObjectPicker(sourceProps)
