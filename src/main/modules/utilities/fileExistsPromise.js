import { promises as fsp } from 'fs'

export const fileExistsPromise = async fileOrDir => {
	try {
		await fsp.access(fileOrDir)
		return true
	} catch (err) {
		return false
	}
}
