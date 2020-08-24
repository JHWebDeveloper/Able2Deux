import { promises as fsp } from 'fs'
import path from 'path'

import { temp } from '../extFileHandlers'

export const upload = async data => {
	const tempFilePath = path.join(temp.imports.path, `${data.id}${path.extname(data.sourceFilePath)}`)

	await fsp.copyFile(data.sourceFilePath, tempFilePath)

	return tempFilePath
}
