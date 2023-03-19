import { promises as fsp } from 'fs'
import path from 'path'
import { fixPathForAsarUnpack } from 'electron-util'

import { placeholder } from './placeholder'

export * from './fileSupportLists'
export * from '../../../shared/utilities'

export const assetsPath = fixPathForAsarUnpack(process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'backgrounds')
	: path.join(__dirname, 'assets', 'backgrounds'))

export const base64Encode = async file => `data:image/png;base64,${await fsp.readFile(file, 'base64')}`

export const base64EncodeOrPlaceholder = async file => {
  if (!file) return placeholder

  try {
    return base64Encode(file)
  } catch (err) {
    console.error(err)
    return placeholder
  }
}

export const fileExistsPromise = async fileOrDir => {
	try {
		await fsp.access(fileOrDir)
		return true
	} catch (err) {
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
