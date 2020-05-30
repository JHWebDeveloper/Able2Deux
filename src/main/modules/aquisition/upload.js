import { promises as fsp } from 'fs'
import path from 'path'
import FileType from 'file-type'

import { temp } from '../utilities/extFileHandlers'
import supported from '../utilities/supportedExentions'

const getMediaKind = ext => {
	if (/^(bmp|jfif|jp(e?g|2)|png|tga|tiff?|webp)$/i.test(ext)) {
		return 'image'
	} else if (/^gif$/i.test(ext)) {
		return 'gif'
	} else {
		return 'video'
	}
}

export const checkFileType = async file => {
	const { ext } = await FileType.fromFile(file.path)

	if (!supported.includes(`.${ext}`)) {
		throw new Error(`Unsupported file type in ${file.name}`)
	}

	return getMediaKind(ext)
}

export const upload = async data => {
	const tempFilePath = path.join(temp.imports.path, `${data.id}${path.extname(data.sourceFilePath)}`)

	await fsp.copyFile(data.sourceFilePath, tempFilePath)

	return tempFilePath
}
