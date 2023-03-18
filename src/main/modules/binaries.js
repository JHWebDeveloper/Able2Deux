import { spawn } from 'child_process'
import { fixPathForAsarUnpack } from 'electron-util'
import { ffmpeg, ffprobe, ytdlp } from 'ffmpeg-ffprobe-yt-dlp-static-electron'
import fluentFfmpeg from 'fluent-ffmpeg'

const asar = {
	ytdl: fixPathForAsarUnpack(ytdlp.path),
	ffmpeg: fixPathForAsarUnpack(ffmpeg.path),
	ffprobe: fixPathForAsarUnpack(ffprobe.path)
}

const ytdlpSpawn = opts => spawn(asar.ytdl, [
	'--ffmpeg-location', asar.ffmpeg,
	'--retries', '3',
	'--socket-timeout', '30',
	'--no-warnings',
	'--no-playlist',
	...opts
])

fluentFfmpeg.setFfmpegPath(asar.ffmpeg)
fluentFfmpeg.setFfprobePath(asar.ffprobe)

export {
	ytdlpSpawn as ytdlp,
	fluentFfmpeg as ffmpeg
}
