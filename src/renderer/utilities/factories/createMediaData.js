import { v1 as uuid } from 'uuid'
import { PENDING } from 'status'

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

const DEFAULT_MEDIA_DATA = Object.freeze({
	// metadata
	id: '',
	refId: '',
	focused: false,
	anchored: false,
	selected: false,
	acquisitionType: '',
	mediaType: 'video',
	hasAlpha: false,
	hasAudio: true,
	url: '',
	isLive: false,
	sourceFilePath: '',
	tempFilePath: '',
	thumbnail: '',
	timecode: 0,
	exportFilename: '',

	// progress data
	status: PENDING,
	downloadETA: 0,
	downloadPercent: 0,
	renderStatus: PENDING,
	renderPercent: 0,

	// media attributes
	title: '',
	duration: 0,
	totalFrames: 0,
	width: 0,
	height: 0,
	aspectRatio: '',
	originalWidth: 0,
	originalHeight: 0,
	originalAspectRatio: '',
	fps: 0,
	channelLayout: '',
	sampleRate: '',
	bitRate: '',

	// file
	filename: '',
	start: 0,
	end: 0,

	// audio
	audioVideoTracks: 'video_audio',
	audioExportFormat: 'wav',

	// framing
	arc: 'none',
	background: 'blue',
	backgroundMotion: 'animated',
	bgColor: '#000000',
	overlay: 'none',

	// source panel
	sourceName: '',
	sourcePrefix: true,
	sourceOnTop: false,
	sourceData: '',

	// position
	centering: 0,
	positionX: 0,
	positionY: 0,

	// scale
	scaleX: 100,
	scaleY: 100,
	scaleLink: true,

	// crop
	cropT: 0,
	cropR: 100,
	cropB: 100,
	cropL: 0,
	cropLinkTB: true,
	cropLinkLR: true,

	// rotation
	transpose: '',
	reflect: '',
	freeRotateMode: 'inside_bounds',
	angle: 0,
	rotatedCentering: 0,

	// keying
	keyingEnabled: false,
	keyingHidden: false,
	keyingType: 'colorkey',
	keyingColor: '#04f404',
	keyingSimilarity: 1,
	keyingBlend: 0,
	keyingThreshold: 0,
	keyingTolerance: 0,
	keyingSoftness: 0,
	
	// color correction
	ccEnabled: false,
	ccHidden: false,
	ccSelectedCurve: 'ccRGB',
	ccRGB: createDefaultCurvePoints(),
	ccR: createDefaultCurvePoints(),
	ccG: createDefaultCurvePoints(),
	ccB: createDefaultCurvePoints()
})

export const createMediaData = async params => {
	const { editorSettings } = await window.ABLE2.interop.requestPrefs()

	params.id = params.id || uuid()
	params.refId = params.id

	if (editorSettings.backgroundMotion === 'auto') {
		editorSettings.backgroundMotion = params.mediaType === 'image' ? 'still' : 'animated'
	}

	return {
		...DEFAULT_MEDIA_DATA,
		...editorSettings,
		...params
	}
}
