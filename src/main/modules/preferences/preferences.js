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

		// fix type error from prefs 5 and earlier
		if (prefs.version < 6) {
			prefs.scaleSliderMax = parseFloat(prefs.scaleSliderMax)
		}

		if (prefs.version < 7) {
			prefs.renderFrameRate = prefs.renderFrameRate.replace(/fps$/, '')

			delete prefs.enableWidescreenGrids
		}

		if (prefs.version < 8) {
			const v8Prefs = {
				...defaultPrefs,
				...prefs,
				warnings: {
					...defaultPrefs.warnings,
					...prefs.warnings
				},
				version: 8
			}

			v8Prefs.aspectRatioMarkers[0].disabled = !prefs.gridButtons._239
			v8Prefs.aspectRatioMarkers[1].disabled = !prefs.gridButtons._185
			v8Prefs.aspectRatioMarkers[2].disabled = !prefs.gridButtons._166
			v8Prefs.aspectRatioMarkers[3].disabled = !prefs.gridButtons._43
			v8Prefs.aspectRatioMarkers[4].disabled = !prefs.gridButtons._11
			v8Prefs.aspectRatioMarkers[5].disabled = !prefs.gridButtons._916

			delete v8Prefs.gridButtons

			await fsp.writeFile(prefsPath, JSON.stringify(v8Prefs))
		}
	}
}

export const loadPrefs = async () => JSON.parse(await fsp.readFile(prefsPath))

export const savePrefs = async prefs => fsp.writeFile(prefsPath, JSON.stringify({
	...prefs,
	version: defaultPrefs.version
}))

export const getDefaultPrefs = () => defaultPrefs
