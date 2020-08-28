import { v1 as uuid } from 'uuid'
import { PENDING } from '../status/types'

export class MediaElement {
	constructor({
		id,
		status,
		acquisitionType = false,
		mediaType = 'video',
		url = false,
		sourceFilePath = false,
		title = '',
		filename = ''
	}) {
		const mediaId = id || uuid()
		
		this.id = mediaId
		this.refId = mediaId
		this.status = status || PENDING
		this.acquisitionType = acquisitionType
		this.mediaType = mediaType
		this.url = url
		this.sourceFilePath = sourceFilePath
		this.tempFilePath = false
		this.download = {
			eta: '00:00:00',
			percent: '0%'
		}
		this.title = title
		this.filename = filename
		this.isLive = false
		this.exportFilename = false
		this.thumbnail = false
		this.duration = 0
		this.width = 0
		this.height = 0
		this.aspectRatio = false
		this.hasAlpha = false
		this.fps = 0
		this.timecode = 0
		this.start = {
			enabled: false,
			display: '00:00:00',
			tc: 0
		}
		this.end = {
			enabled: false,
			display: '00:00:00',
			tc: 0
		}
		this.arc = 'none'
		this.background = 'blue'
		this.overlay = 'none'
		this.source = {
			sourceName: '',
			prefix: true,
			onTop: false,
			data: ''
		}
		this.centering = 0
		this.position = {
			x: 0,
			y: 0
		}
		this.scale = {
			x: 100,
			y: 100,
			link: true
		}
		this.crop = {
			t: 0,
			r: 0,
			b: 0,
			l: 0,
			linkTB: true,
			linkLR: true
		}
		this.rotation = {
			angle: '',
			reflect: ''
		}
		this.audio = {
			exportAs: 'video_audio',
			format: 'wav'
		}
		this.render = {
			status: PENDING,
			percent: 0
		}
	}
}
