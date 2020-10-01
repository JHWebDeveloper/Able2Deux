import { v1 as uuid } from 'uuid'
import { PENDING } from '../../status/types'

export const createMediaData = ({
	id,
	status,
	acquisitionType = false,
	mediaType = 'video',
	url = false,
	sourceFilePath = false,
	title = '',
	filename = ''
}) => {
	id = id || uuid()
	status = status || PENDING

	return {
		id,
		refId: id,
		status,
		acquisitionType,
		mediaType,
		url,
		sourceFilePath,
		tempFilePath: false,
		download: {
			eta: '00:00:00',
			percent: '0%'
		},
		title,
		filename,
		isLive: false,
		exportFilename: false,
		thumbnail: false,
		duration: 0,
		width: 0,
		height: 0,
		aspectRatio: false,
		hasAlpha: false,
		fps: 0,
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
}
