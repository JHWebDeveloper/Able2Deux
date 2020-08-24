import { promises as fsp } from 'fs'
import path from 'path'

import { scratchDisk } from '../scratchDisk'

export const upload = async data => {
	const tempFilePath = path.join(scratchDisk.imports.path, `${data.id}${path.extname(data.sourceFilePath)}`)

	await fsp.copyFile(data.sourceFilePath, tempFilePath)

	return tempFilePath
}
