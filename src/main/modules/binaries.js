import { spawn } from 'child_process'
import fluentFfmpeg from 'fluent-ffmpeg'

import {
	YTDLP_PATH,
	FFMPEG_PATH,
	FFPROBE_PATH 
} from './constants'

const ytdlpSpawn = opts => spawn(YTDLP_PATH, [
	'--ffmpeg-location', FFMPEG_PATH,
	'--retries', '3',
	'--socket-timeout', '30',
	'--no-warnings',
	'--no-playlist',
	'--merge-output-format', 'mkv',
	...opts
])

fluentFfmpeg.setFfmpegPath(FFMPEG_PATH)
fluentFfmpeg.setFfprobePath(FFPROBE_PATH)

export {
	ytdlpSpawn as ytdlp,
	fluentFfmpeg as ffmpeg
}
