import { v1 as uuid } from 'uuid'
import { PENDING } from '../../status/types'

const defaultMediaData = {
	id: '',
	refId: '',
	status: PENDING,
	acquisitionType: 'video',
	mediaType: '',
	url: '',
	sourceFilePath: '',
	tempFilePath: '',
	download: {
		eta: '00:00:00',
		percent: '0%'
	},
	title: '',
	filename: '',
	isLive: false,
	exportFilename: '',
	thumbnail: '',
	duration: 0,
	width: 0,
	height: 0,
	aspectRatio: '',
	hasAlpha: false,
	fps: 0,
	channelLayout: '',
	sampleRate: '',
	bitRate: '',
	timecode: 0,
	start: {
		enabled: false,
		display: '00:00:00',
		tc: 0
	},
	end: {
		enabled: false,
		display: '00:00:00',
		tc: 0
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
		r: 0,
		b: 0,
		l: 0,
		linkTB: true,
		linkLR: true
	},
	rotation: {
		angle: '',
		reflect: ''
	},
	audio: {
		exportAs: 'video_audio',
		format: 'wav'
	},
	render: {
		status: PENDING,
		percent: 0
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
