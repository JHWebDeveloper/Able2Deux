import { promises as fsp } from 'fs'

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
