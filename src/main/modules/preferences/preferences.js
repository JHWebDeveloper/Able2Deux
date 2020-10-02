import { app } from 'electron'
import { promises as fsp } from 'fs'
import path from 'path'

import defaultPrefs from './default'
import { fileExistsPromise } from '../utilities'

const dev = process.env.NODE_ENV === 'development'

const prefsDir = dev
	? path.join(__dirname, '..', '..', 'data')
	: path.join(app.getPath('appData'), 'able2', 'prefs')

export const prefsPath = path.join(prefsDir, 'preferences.json')

export const initPreferences = async () => {
	try {
		const prefsDirExists = await fileExistsPromise(prefsDir)

		if (!prefsDirExists) await fsp.mkdir(prefsDir)

		const prefsExists = await fileExistsPromise(prefsPath)

		if (!prefsExists) {
			await fsp.writeFile(prefsPath, JSON.stringify(defaultPrefs))
		} else {
			const prefs = JSON.parse(await fsp.readFile(prefsPath))

			// legacy convert Able2 v1 prefs to v2
			if (!prefs.version) {
				await fsp.writeFile(prefsPath, JSON.stringify({
					...defaultPrefs,
					renderOutput: prefs.renderOutput,
					saveLocations: prefs.directories,
					warnings: {
						...defaultPrefs.warnings,
						sourceOnTop: prefs.sourceOnTopWarning
					}
				})) 
			}
			
			if (prefs.version < 5) {
				await fsp.writeFile(prefsPath, JSON.stringify({
					...defaultPrefs,
					...prefs,
					version: 5
				}))
			}
		}
	} catch (err) {
		console.error(err)
	}
}

export const loadPrefs = async () => JSON.parse(await fsp.readFile(prefsPath))

export const savePrefs = async prefs => fsp.writeFile(prefsPath, JSON.stringify({
	...prefs,
	version: defaultPrefs.version
}))

export const getDefaultPrefs = () => defaultPrefs
