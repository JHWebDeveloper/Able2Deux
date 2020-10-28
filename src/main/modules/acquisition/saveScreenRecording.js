import { promises as fsp } from 'fs'
import path from 'path'
import { Decoder, Reader, tools } from 'ts-ebml'

import { scratchDisk } from '../scratchDisk'

const fixDuration = async buffer => {
	const decoder = new Decoder()
	const reader = new Reader()

	reader.logging = false
	reader.drop_default_duration = false

	const elms = decoder.decode(buffer)
	const len = elms.length

	for (let i = 0; i < len; i++) {
		reader.read(elms[i])
	}

	reader.stop()

	const metadata = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues)
	const body = buffer.slice(reader.metadataSize)
	
	return Buffer.concat([
		Buffer.from(metadata),
		Buffer.from(body)
	])
}

export const saveScreenRecording = async ({ id, buffer, screenshot }) => {
	const fixedBuffer = screenshot ? buffer : await fixDuration(buffer)
	const filePath = path.join(scratchDisk.imports.path, `${id}.${screenshot ? 'png' : 'webm'}`)
	const encoding = screenshot ? 'base64' : 'utf8'

	await fsp.writeFile(filePath, fixedBuffer, { encoding })

	return filePath
}
