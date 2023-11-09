import { promises as fsp } from 'fs'
import path from 'path'
import { fixPathForAsarUnpack } from 'electron-util'
import placeholder from './placeholder'

export * from './fileSupportLists'
export * from '../../../shared/utilities'

export const assetsPath = fixPathForAsarUnpack(process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'backgrounds')
	: path.join(__dirname, 'assets', 'backgrounds'))

export const base64Encode = async file => `data:image/png;base64,${await fsp.readFile(file, 'base64')}`

export const base64EncodeOrPlaceholder = async file => {
	if (file) try {
		return base64Encode(file)
	} catch (err) {
		console.error(err)
	}

	return placeholder
}

export const fileExistsPromise = async fileOrDir => {
	try {
		await fsp.access(fileOrDir)
		return true
	} catch {
		return false
	}
}

export const getOverlayInnerDimensions = (size, overlay) => {
	const is1080 = size === '1080'

	return {
		tv: {
			width: is1080 ? 1576 : 1050,
			height: is1080 ? 886 : 590,
			y: is1080 ? 78 : 52
		},
		laptop: {
			width: is1080 ? 1366 : 912,
			height: is1080 ? 778 : 518,
			y: is1080 ? 86 : 58
		}
	}[overlay]
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
	setTimeout(() => {
		resolve()
	}, time)
})
