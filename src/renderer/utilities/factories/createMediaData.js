import { v1 as uuid } from 'uuid'
import { PENDING } from 'status'

const defaultMediaData = {
	id: '',
	refId: '',
	status: PENDING,
	download: {
		eta: '00:00:00',
		percent: '0%'
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
		angle: '',
		reflect: ''
	}
}

export const createMediaData = params => {
	params.id = params.id || uuid()
	params.refId = params.id

	return {
		...defaultMediaData,
		...params
	}
}
