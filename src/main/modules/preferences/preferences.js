import { promises as fsp } from 'fs'
import { prefsPath } from '../utilities/extFileHandlers'
import defaultPrefs from './default'

export const loadPrefs = async () => JSON.parse(await fsp.readFile(prefsPath))

export const savePrefs = async prefs => (
	fsp.writeFile(prefsPath, JSON.stringify({
		...prefs,
		version: defaultPrefs.version
	}))
)
