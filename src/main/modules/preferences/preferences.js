import { promises as fsp } from 'fs'
import { prefsPath } from '../utilities/extFileHandlers'

export const loadPrefs = async () => (
	JSON.parse(await fsp.readFile(prefsPath))
)

export const savePrefs = async newPrefs => (
	fsp.writeFile(prefsPath, JSON.stringify(newPrefs))
)
