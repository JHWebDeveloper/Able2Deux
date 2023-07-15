import { objectPick } from 'utilities'

const createObjectPicker = keys => props => objectPick(props, keys)

/* dyanmicProps are props that can be copied from one media item to another
    and should cause a preview render on change */
const dynamicProps = [
	'audioVideoTracks',
	'audioExportFormat',
	'arc',
	'background',
	'backgroundMotion',
	'bgColor',
	'overlay',
	'sourceName',
	'sourcePrefix',
	'sourceOnTop',
	'centering',
	'positionX',
	'positionY',
	'scaleX',
	'scaleY',
	'cropT',
	'cropR',
	'cropB',
	'cropL',
	'transpose',
	'reflect',
	'freeRotateMode',
	'angle',
	'rotatedCentering',
	'keyingEnabled',
	'keyingHidden',
	'keyingType',
	'keyingColor',
	'keyingSimilarity',
	'keyingBlend',
	'keyingThreshold',
	'keyingTolerance',
	'keyingSoftness',
	'ccEnabled',
	'ccHidden',
	'ccRGB',
	'ccR',
	'ccG',
	'ccB'
]

export const extractCopyPasteProps = createObjectPicker([
	...dynamicProps,
	'scaleLink',
	'cropLinkTB',
	'cropLinkLR',
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


export const extractColorCorrectionProps = createObjectPicker(['ccEnabled', 'ccHidden', 'ccSelectedCurve', 'ccRGB', 'ccR', 'ccG', 'ccB'])

export const extractCommonEditPanelProps = createObjectPicker([
	'id',
	'mediaType',
	'multipleItems',
	'multipleItemsSelected',
	'allItemsSelected',
	'width',
	'height',
	'aspectRatio',
	'dispatch'
])

export const extractCropProps = createObjectPicker(['cropT', 'cropR', 'cropB', 'cropL', 'cropLinkTB', 'cropLinkLR'])

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

export const extractFramingProps = createObjectPicker(['arc', 'background', 'bgMotion', 'bgColor', 'overlay'])

export const extractKeyingProps = createObjectPicker([
	'keyingEnabled',
	'keyingHidden',
	'keyingType',
	'keyingColor',
	'keyingSimilarity',
	'keyingBlend',
	'keyingThreshold',
	'keyingTolerance',
	'keyingSoftness'
])

export const extractRotationProps = createObjectPicker([
	'transpose',
	'reflect',
	'freeRotateMode',
	'angle',
	'rotatedCentering'
])
