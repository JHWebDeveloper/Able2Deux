import { desktopCapturer, systemPreferences } from 'electron'
import { promises as fsp } from 'fs'
import path from 'path'

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

export const saveScreenRecording = async ({ id, buffer, screenshot }) => {
	const [ ext, encoding ] = screenshot ? ['png', 'base64'] : ['webm', 'utf8']
	const filePath = path.join(scratchDisk.imports.path, `${id}.${ext}`)

	await fsp.writeFile(filePath, buffer, { encoding })

	return filePath
}
