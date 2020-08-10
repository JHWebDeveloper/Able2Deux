import { promises as fsp } from 'fs'
import path from 'path'
import { temp } from '../utilities/extFileHandlers'

export const saveScreenRecording = async ({ id, buffer, screenshot }) => {
	const filePath = path.join(temp.imports.path, `${id}.${screenshot ? 'png' : 'webm'}`)
	const encoding = screenshot ? 'base64' : 'utf8'

	await fsp.writeFile(filePath, buffer, { encoding })

	return filePath
}
