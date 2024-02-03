import { promises as fsp } from 'fs'

import { PLACEHOLDER } from '../constants'

export * from '../../../shared/utilities'

export const base64Encode = async file => `data:image/png;base64,${await fsp.readFile(file, 'base64')}`

export const base64EncodeOrPlaceholder = async file => {
	if (file) {
		try {
			return await base64Encode(file)
		} catch (err) {
			console.error(err)
		}
	}

	return PLACEHOLDER
}

export const fileExistsPromise = async fileOrDir => {
	try {
		await fsp.access(fileOrDir)
		return true
	} catch {
		return false
	}
}

const isObject = val => !!val && typeof val === 'object' && val.constructor === Object

export const innerMergeObjectKeys = (objL, objR) => {
	const keys = [...new Set([...Object.keys(objL), ...Object.keys(objR)])]
	const merged = {}

	for (const key of keys) {
		const inLeft = key in objL
		const inBoth = inLeft && key in objR

		if (inBoth && isObject(objL[key]) && isObject(objR[key])) {
			merged[key] = innerMergeObjectKeys(objL[key], objR[key])
		} else if (inBoth) {
			merged[key] = objR[key]
		} else if (inLeft) {
			merged[key] = objL[key]
		}
	}

	return merged
}

export const delay = (time = 1000) => new Promise(resolve => {
	setTimeout(resolve, time)
})
