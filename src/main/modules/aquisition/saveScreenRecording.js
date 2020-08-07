import { promises as fsp } from 'fs'
import path from 'path'
import ffmpeg from '../utilities/ffmpeg'
import { temp } from '../utilities/extFileHandlers'

const fixScreenRecord = (original, filePath) => new Promise((resolve, reject) => {
	ffmpeg(original)
		.outputOptions([
			'-filter:v fps=fps=60',
			'-preset:v ultrafast'
		])
		.output(filePath)
		.on('end', resolve)
		.on('error', reject)
		.run()
})

export const saveScreenRecording = async ({ id, buffer }) => {
	const filePath = path.join(temp.imports.path, `${id}.mp4`)
	const original = path.join(temp.imports.path, `${id}.original.webm`)

	await fsp.writeFile(original, buffer)
	await fixScreenRecord(original, filePath)
	
	fsp.unlink(original)

	return filePath
}
