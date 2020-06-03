import { v1 as uuid } from 'uuid'
import { PENDING } from '../status/types'

class MediaElement {
	constructor({
		aquisitionType = false,
		mediaType = false,
		url = false,
		sourceFilePath = false,
		title = '',
		filename = ''
	}) {
		const id = uuid()
		
		this.id = id
		this.refId = id
		this.status = PENDING
		this.aquisitionType = aquisitionType
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
		this.thumbnail = false
		this.duration = 0
		this.width = 0
		this.height = 0
		this.aspectRatio = false
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
		},
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
		},
		this.render = {
			percent: 0,
			timemark: '00:00:00',
			frames: 0
		}
	}
}

export { MediaElement }
