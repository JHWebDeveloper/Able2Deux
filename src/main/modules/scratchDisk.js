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

const clearFilesByAge = async (dir, age) => {
	const files = await fsp.readdir(dir)
	const now = Date.now()

	return Promise.all(files.map(file => (async () => {
		const filePath = path.join(dir, file)
		const { ctime } = await fsp.lstat(filePath)
	
		if (now - ctime > age) {
			return fsp.unlink(filePath)
		} else {
			return Promise.resolve()
		}
	})()))
}

export const scratchDisk = {
	imports: {
		path: '',
		clear: id => clearFiles(scratchDisk.imports.path, id),
		clearByAge: () => clearFilesByAge(scratchDisk.imports.path, 144e4)
	},
	exports: {
		path: '',
		clear: id => clearFiles(scratchDisk.exports.path, id)
	},
	previews: {
		path: '',
		clear: id => clearFiles(scratchDisk.previews.path, id)
	},
	clearAll: () => Promise.all([
		scratchDisk.imports.clearByAge(),
		scratchDisk.exports.clear(),
		scratchDisk.previews.clear()
	])
}

export const initScratchDisk = async () => {
	await updateScratchDisk()
	await scratchDisk.clearAll() 
}

export const updateScratchDisk = async () => {
	const prefs = JSON.parse(await fsp.readFile(prefsPath))
	const opts = { recursive: true }

	scratchDisk.imports.path = path.join(prefs.scratchDisk.imports, 'able2_imports')
	scratchDisk.exports.path = path.join(prefs.scratchDisk.exports, 'able2_exports')
	scratchDisk.previews.path = path.join(prefs.scratchDisk.previews, 'able2_previews')

	return Promise.all([
		fsp.mkdir(scratchDisk.imports.path, opts),
		fsp.mkdir(scratchDisk.exports.path, opts),
		fsp.mkdir(scratchDisk.previews.path, opts)
	])
}
