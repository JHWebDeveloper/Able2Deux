import { spawn } from 'child_process'
import { fixPathForAsarUnpack } from 'electron-util'
import { path as ytdlStatic } from 'youtube-dl-ffmpeg-ffprobe-static'
import { path as ffmpegStatic } from 'ffmpeg-static-electron'
import { path as ffprobeStatic } from 'ffprobe-static-electron'
import ffmpeg from 'fluent-ffmpeg'

const asar = {
	ytdl: fixPathForAsarUnpack(ytdlStatic),
	ffmpeg: fixPathForAsarUnpack(ffmpegStatic),
	ffprobe: fixPathForAsarUnpack(ffprobeStatic)
}

const ytdlOpts = [
	'--ffmpeg-location', asar.ffmpeg,
	'--retries', '3',
	'--socket-timeout', '30',
	'--no-warnings',
	'--no-playlist'
]

const ytdl = opts => spawn(asar.ytdl, [...ytdlOpts, ...opts])

ffmpeg.setFfmpegPath(asar.ffmpeg)
ffmpeg.setFfprobePath(asar.ffprobe)

export { ytdl, ffmpeg }
