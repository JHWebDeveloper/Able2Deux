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

const defaultMediaData = {
	id: '',
	refId: '',
	status: PENDING,
	download: {
		eta: 0,
		percent: 0
	},
	render: {
		status: PENDING,
		percent: 0
	},
	acquisitionType: '',
	mediaType: 'video',
	hasAlpha: false,
	url: '',
	isLive: false,
	sourceFilePath: '',
	tempFilePath: '',
	thumbnail: '',
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
	timecode: 0,
	filename: '',
	exportFilename: '',
	start: 0,
	end: 0,
	audio: {
		exportAs: 'video_audio',
		format: 'wav'
	},
	arc: 'none',
	background: 'blue',
	backgroundMotion: 'animated',
	bgColor: '#000000',
	overlay: 'none',
	source: {
		sourceName: '',
		prefix: true,
		onTop: false,
		data: ''
	},
	centering: 0,
	position: {
		x: 0,
		y: 0
	},
	scale: {
		x: 100,
		y: 100,
		link: true
	},
	crop: {
		t: 0,
		r: 100,
		b: 100,
		l: 0,
		linkTB: true,
		linkLR: true
	},
	rotation: {
		transpose: '',
		reflect: '',
		freeRotateMode: 'inside_bounds',
		angle: 0,
		center: 0
	},
	keying: {
		enabled: false,
		hidden: false,
		type: 'colorkey',
		color: '#04f404',
		similarity: 1,
		blend: 0,
		threshold: 0,
		tolerance: 0,
		softness: 0
	},
	colorCurves: {
		enabled: false,
		hidden: false,
		selectedCurve: 'rgb',
		rgb: createDefaultCurvePoints(),
		r: createDefaultCurvePoints(),
		g: createDefaultCurvePoints(),
		b: createDefaultCurvePoints()
	}
}

export const createMediaData = async params => {
	const { editorSettings } = await window.ABLE2.interop.requestPrefs()

	params.id = params.id || uuid()
	params.refId = params.id

	if (editorSettings.backgroundMotion === 'auto') {
		editorSettings.backgroundMotion = params.mediaType === 'image' ? 'still' : 'animated'
	}

	return {
		...defaultMediaData,
		...editorSettings,
		...params
	}
}
