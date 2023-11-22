export * from '../../../shared/constants.js'

export const DEFAULT_LIMIT_TO = Object.freeze(['gif', 'image', 'video'])

export const SUPPORTED_IMAGE_CODECS = Object.freeze([
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
	'webp',
	'wmv3image',
	'xbm',
	'xface',
	'xpm',
	'xwd'
])

export const SUPPORTED_EXTENSIONS = Object.freeze({
	audio: ['aa', 'aac', 'ac3', 'aiff', 'ape', 'au', 'flac', 'mp2', 'mp3', 'm4a', 'm4b', 'm4p', 'oga', 'opus', 'ra', 'sln', 'tta', 'voc', 'wav', 'wma', 'wv', 'xwma', '8svx'],
	images: ['apng', 'bmp', 'gif', 'jfi', 'jfif', 'jpeg', 'jpg', 'jp2', 'j2c', 'mjpeg', 'mng', 'pbm', 'pgm', 'png', 'pnm', 'ppm', 'psb', 'psd', 'tga', 'tif', 'tiff', 'webp'],
	video: ['asf', 'avi', 'evo', 'flv', 'f4v', 'mkv', 'mov', 'mpe', 'mpeg', 'mpv', 'mp4', 'mts', 'mxf', 'm2ts', 'm4v', 'ogg', 'ogv', 'rm', 'ts', 'vob', 'webm', 'wmv', '3gp', '3g2'],
  get all() {
    return [...this.audio, ...this.images, ...this.video]
  }
})