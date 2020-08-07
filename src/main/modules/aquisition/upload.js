import { promises as fsp } from 'fs'
import path from 'path'
import ffmpeg from '../utilities/ffmpeg'

import { temp } from '../utilities/extFileHandlers'

const supportedImageCodecs = [
	'alias_pix',
	'bmp',
	'brender_pix',
	'dds',
	'dpx',
	'exr',
	'fits',
	'jpeg2000',
	'libopenjpeg',
	'jpegls',
	'ljpeg',
	'mjpeg',
	'pam',
	'pbm',
	'pcx',
	'pfm',
	'pgm',
	'pgmyuv',
	'png',
	'ppm',
	'psd',
	'ptx',
	'sgi',
	'sunrast',
	'targa',
	'tiff',
	'vc1image',
	'wmv3image',
	'xbm',
	'xface',
	'xpm',
	'xwd'
]

const getMediaKind = (codec, ext) => {
	if (/^gif|apng$/i.test(codec) || (/^mjpegb?$/i.test(codec) && /^mjpe?g$/i.test(ext))) {
		return 'gif'
	} else if (supportedImageCodecs.includes(codec)) {
		return 'image'
	} else {
		return 'video'
	}
}

export const checkFileType = file => new Promise((resolve, reject) => {
	ffmpeg.ffprobe(file, (ffprobeErr, metadata) => {
		if (ffprobeErr) reject(ffprobeErr)

		ffmpeg.getAvailableCodecs((err, codecs) => {
			if (err) reject(err)
			
			if (!metadata.streams || metadata.streams.length === 0) {
				reject(new Error('Unsupported file type'))
			}

			const video = {}
			const audio = {}

			video.stream = metadata.streams.find(stream => stream.codec_type === 'video')
			audio.stream = metadata.streams.find(stream => stream.codec_type === 'audio')

			if (video.stream) {
				video.codec = codecs[video.stream.codec_name]
				video.supported = video.codec && video.codec.canDecode
			}

			if (audio.stream) {
				audio.codec = codecs[audio.stream.codec_name]
				audio.supported = audio.codec && audio.codec.canDecode
			}
			
			if (
				audio.supported && !video.stream || // audio only
				audio.supported && supportedImageCodecs.includes(video.stream.codec_name) // audio with album artwork
			) {
				resolve('audio')
			} else if (
				video.supported && audio.supported || // video with audio
				video.supported && !audio.stream // video only
			) {
				resolve(getMediaKind(video.stream.codec_name, path.extname(file)))
			} else {
				reject(new Error('Unsupported file type'))
			}
		})
	})
})

export const upload = async data => {
	const tempFilePath = path.join(temp.imports.path, `${data.id}${path.extname(data.sourceFilePath)}`)

	await fsp.copyFile(data.sourceFilePath, tempFilePath)

	return tempFilePath
}
