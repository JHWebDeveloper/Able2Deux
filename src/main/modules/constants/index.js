import { app } from 'electron'
import path from 'path'
import { fixPathForAsarUnpack } from 'electron-util'
import { ffmpeg, ffprobe, ytdlp } from 'ffmpeg-ffprobe-yt-dlp-static-electron'

export * from './placeholder'
export * from '../../../shared/constants.js'

// ---- FILE TYPE LISTS --------

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

// ---- PATHS --------

export const TEMP_DIRECTORY_PATH = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'temp')
	: app.getPath('temp')

export const ASSETS_PATH = fixPathForAsarUnpack(process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'backgrounds')
	: path.join(__dirname, 'assets', 'backgrounds'))

export const DATA_STORE_PATH = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'data')
	: path.join(app.getPath('appData'), 'able2', 'prefs')

export const PREFERENCES_PATH = path.join(DATA_STORE_PATH, 'preferences.json')
export const PRESETS_PATH = path.join(DATA_STORE_PATH, 'presets.json')
export const WORKSPACE_PATH = path.join(DATA_STORE_PATH, 'workspace.json')

export const YTDLP_PATH = fixPathForAsarUnpack(ytdlp.path)
export const FFMPEG_PATH = fixPathForAsarUnpack(ffmpeg.path)
export const FFPROBE_PATH = fixPathForAsarUnpack(ffprobe.path)

// ---- TUPLES --------

export const DEFAULT_LIMIT_TO = Object.freeze(['gif', 'image', 'video'])
