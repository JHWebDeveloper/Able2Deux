import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static-electron'
import ffprobeStatic from 'ffprobe-static-electron'
import { fixPathForAsarUnpack } from 'electron-util'

ffmpeg.setFfmpegPath(fixPathForAsarUnpack(ffmpegStatic.path))
ffmpeg.setFfprobePath(fixPathForAsarUnpack(ffprobeStatic.path))

export default ffmpeg
