import { promises as fsp } from 'fs'
import path from 'path'

import { scratchDisk } from '../scratchDisk'

export const upload = async ({ id, sourceFilePath }) => {
	const tempFilePath = path.join(scratchDisk.imports.path, `${id}${path.extname(sourceFilePath)}`)

	try {
		await fsp.copyFile(sourceFilePath, tempFilePath)
	} catch (err) {
		console.error(err)
		throw new Error(`An error occurred while loading ${path.basename(sourceFilePath)}.`)
	}

	return tempFilePath
}
