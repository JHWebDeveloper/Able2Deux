import { desktopCapturer } from 'electron'
import { promises as fsp } from 'fs'
import path from 'path'
import { Decoder, Reader, tools } from 'ts-ebml'

import { scratchDisk } from '../scratchDisk'

export const getRecordSources = async () => {
	if (
		process.env.NODE_ENV === 'production' &&
		process.platform === 'darwin' &&
		systemPreferences.getMediaAccessStatus('screen') !== 'granted'
	) {
		return []
	}

	const sources = await desktopCapturer.getSources({
		types: ['screen', 'window'],
		thumbnailSize: {
			width: 560,
			height: 288
		}
	})

	return sources
		.filter(({ name }) => name !== 'Able2')
		.map(src => ({
			...src,
			thumbnail: src.thumbnail.toDataURL()
		}))
		.reduce((arr, src) => {
			arr[/^screen/.test(src.id) ? 0 : 1].push(src)
			return arr
		}, [[], []])
		.flat()
}

const fixDuration = buffer => {
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
	const fixedBuffer = screenshot ? buffer : fixDuration(buffer)
	const filePath = path.join(scratchDisk.imports.path, `${id}.${screenshot ? 'png' : 'webm'}`)
	const encoding = screenshot ? 'base64' : 'utf8'

	await fsp.writeFile(filePath, fixedBuffer, { encoding })

	return filePath
}
