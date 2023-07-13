import { objectOmit, objectPick } from 'utilities'

const createObjectOmitter = (...keys) => props => objectOmit(props, keys)
const createObjectPicker = (...keys) => props => objectPick(props, keys)

export const extractCopyPasteSettings = createObjectOmitter(
  'id',
  'refId',
  'focused',
  'anchored',
  'selected',
  'acquisitionType',
  'mediaType',
  'hasAlpha',
  'hasAudio',
  'url',
  'isLive',
  'sourceFilePath',
  'tempFilePath',
  'thumbnail',
  'timecode',
  'exportFilename',
  'status',
  'downloadETA',
  'downloadPercent',
  'renderStatus',
  'renderPercent',
  'title',
  'duration',
  'totalFrames',
  'width',
  'height',
  'aspectRatio',
  'originalWidth',
  'originalHeight',
  'originalAspectRatio',
  'fps',
  'channelLayout',
  'sampleRate',
  'bitRate',
  'filename',
  'start',
  'end'
)

export const extractDefaultPrefs = createObjectPicker(
  'saveLocations',
  'split',
  'optimize',
  'timerEnabled',
  'timer',
  'screenshot',
  'previewQuality',
  'previewHeight',
  'aspectRatioMarkers'
)

export const extractCommonProps = createObjectPicker('id', 'mediaType', 'multipleItems', 'width', 'height', 'aspectRatio', 'dispatch')

export const extractScaleProps = createObjectPicker('scaleX', 'scaleY', 'scaleLink')

export const extractCropProps = createObjectPicker('cropT', 'cropR', 'cropB', 'cropL', 'cropLinkTB', 'cropLinkLR')

export const extractKeyingProps = createObjectPicker(
  'keyingEnabled',
  'keyingHidden',
  'keyingType',
  'keyingColor',
  'keyingSimilarity',
  'keyingBlend',
  'keyingThreshold',
  'keyingTolerance',
  'keyingSoftness'
)

export const extractColorCorrectionProps = createObjectPicker('ccEnabled', 'ccHidden', 'ccSelectedCurve', 'ccRGB', 'ccR', 'ccG', 'ccB')
