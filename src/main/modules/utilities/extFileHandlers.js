import { promises as fsp } from 'fs'
import path from 'path'
import { app } from 'electron'
import { fixPathForAsarUnpack } from 'electron-util'

import fileExistsPromise from './fileExistsPromise'
import defaultPrefs from '../preferences/default'

const dev = process.env.NODE_ENV === 'development'

const prefsDir = dev
	? path.join(__dirname, '..', '..', 'data')
	: path.join(app.getPath('appData'), 'able2', 'prefs')

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

export const prefsPath = path.join(prefsDir, 'preferences.json')

export const initExtDirectories = async () => {
	try {
		const prefsDirExists = await fileExistsPromise(prefsDir)

		if (!prefsDirExists) await fsp.mkdir(prefsDir)

		const prefsExists = await fileExistsPromise(prefsPath)

		if (!prefsExists) {
			await fsp.writeFile(prefsPath, JSON.stringify(defaultPrefs))
		} else {
			const prefs = JSON.parse(await fsp.readFile(prefsPath))

			// legacy convert Able2 v1 prefs to v2
			if (!prefs.version) await fsp.writeFile(prefsPath, JSON.stringify({
				...defaultPrefs,
				renderOutput: prefs.renderOutput,
				saveLocations: prefs.directories,
				warnings: {
					...defaultPrefs.warnings,
					sourceOnTop: prefs.sourceOnTopWarning
				}
			}))
		}

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

export const assetsPath = fixPathForAsarUnpack(dev
	? path.resolve(__dirname, '..', '..', 'backgrounds')
	: path.join(__dirname, 'assets', 'backgrounds'))
