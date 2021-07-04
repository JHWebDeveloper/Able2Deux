import { promises as fsp } from 'fs'
import path from 'path'

import { scratchDisk } from '../scratchDisk'

export const upload = async data => {
	const tempFilePath = path.join(scratchDisk.imports.path, `${data.id}${path.extname(data.sourceFilePath)}`)

	try {
		await fsp.copyFile(data.sourceFilePath, tempFilePath)
	} catch (err) {
		console.error(err)
		throw new Error(`An error occurred while loading ${path.basename(data.sourceFilePath)}.`)
	}

	return tempFilePath
}
