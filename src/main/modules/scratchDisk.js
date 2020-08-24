import { promises as fsp } from 'fs'
import path from 'path'

import { prefsPath } from './preferences/preferences'

const clearFiles = async (dir, id) => {
	const files = await fsp.readdir(dir)

	if (!files.length) return false

	if (id) {
		const regex = new RegExp(`^${id}`)
		const matches = files.filter(file => file.match(regex))

		return Promise.all(matches.map(file => fsp.unlink(path.join(dir, file))))
	}

	return Promise.all(files.map(file => fsp.unlink(path.join(dir, file))))
}

export const temp = {
	imports: {
		path: '',
		clear: id => clearFiles(temp.imports.path, id)
	},
	exports: {
		path: '',
		clear: id => clearFiles(temp.exports.path, id)
	},
	previews: {
		path: '',
		clear: id => clearFiles(temp.previews.path, id)
	},
	clearAll: () => Promise.all([
		temp.imports.clear(),
		temp.exports.clear(),
		temp.previews.clear()
	])
}

export const initScratchDisk = async () => {
	try {
		await updateScratchDisk()

		temp.clearAll()	
	} catch (err) {
		console.error(err)
	}
}

export const updateScratchDisk = async () => {
	const { scratchDisk } = JSON.parse(await fsp.readFile(prefsPath))
	const opts = { recursive: true }

	temp.imports.path = path.join(scratchDisk.imports, 'able2_imports')
	temp.exports.path = path.join(scratchDisk.exports, 'able2_exports')
	temp.previews.path = path.join(scratchDisk.previews, 'able2_previews')

	return Promise.all([
		fsp.mkdir(temp.imports.path, opts),
		fsp.mkdir(temp.exports.path, opts),
		fsp.mkdir(temp.previews.path, opts)
	])
}
