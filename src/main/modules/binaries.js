import { spawn } from 'child_process'
import { fixPathForAsarUnpack } from 'electron-util'
import ytdlStatic from 'youtube-dl-ffmpeg-ffprobe-static'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'

const asar = {
	ytdl: fixPathForAsarUnpack(ytdlStatic.path),
	ffmpeg: fixPathForAsarUnpack(ffmpegStatic.path),
	ffprobe: fixPathForAsarUnpack(ffprobeStatic.path)
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
