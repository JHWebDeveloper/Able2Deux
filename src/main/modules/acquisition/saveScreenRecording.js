import { promises as fsp } from 'fs'
import path from 'path'
import { temp } from '../utilities/extFileHandlers'

export const saveScreenRecording = async ({ id, buffer }) => {
	const filePath = path.join(temp.imports.path, `${id}.webm`)

	await fsp.writeFile(filePath, buffer)

	return filePath
}
