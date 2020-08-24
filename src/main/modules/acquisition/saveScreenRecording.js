import { promises as fsp } from 'fs'
import path from 'path'
import { Decoder, Reader, tools } from 'ts-ebml'

import { temp } from '../scratchDisk'

const fixDuration = async buffer => {
	const decoder = new Decoder()
	const reader = new Reader()

	reader.logging = false
	reader.drop_default_duration = false

	const elms = decoder.decode(buffer)

	elms.forEach(elm => reader.read(elm))

	reader.stop()

	const metadata = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues)
	const body = buffer.slice(reader.metadataSize)
	
	return Buffer.concat([
		Buffer.from(metadata),
		Buffer.from(body)
	])
}

export const saveScreenRecording = async ({ id, buffer, screenshot }) => {
	let fixedBuffer = false
	let extension = false
	let encoding = false

	if (screenshot) {
		fixedBuffer = buffer
		extension = 'png'
		encoding = 'base64'
	} else {
		fixedBuffer = await fixDuration(buffer)
		extension = 'webm'
		encoding = 'utf8'
	}

	const filePath = path.join(temp.imports.path, `${id}.${extension}`)

	await fsp.writeFile(filePath, fixedBuffer, { encoding })

	return filePath
}
