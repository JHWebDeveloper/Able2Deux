import { promises as fsp } from 'fs'
import path from 'path'

import { ytdl } from '../binaries'
import { scratchDisk } from '../scratchDisk'

const downloads = new Map()

const truncateUrl = (url, limit = 100) => url.length > limit ? `${url.slice(0, 96)}...` : url

/* --- CANCEL DOWNLOAD --- */

export const cancelDownload = id => downloads.get(id)?.kill('SIGTERM')

export const stopLiveDownload = id => downloads.get(id)?.kill('SIGINT')

const removeDownload = id => {
	if (id) {
		downloads.delete(id)
	} else {
		downloads.clear()
	}

	return scratchDisk.imports.clear(id)
}


/* --- DOWNLOAD --- */

const parseYTDLOutput = (str, regex) => {
	const result = str.match(regex)
	return result?.[0]
}

const getTempFilePath = async id => {
	const regex = new RegExp(`^${id}`)
	const files = await fsp.readdir(scratchDisk.imports.path)
	const file = files.find(f => regex.test(f))

	return path.join(scratchDisk.imports.path, file)
}

const createDownloadError = url => new Error(`An error occured while downloading from ${truncateUrl(url)}.`)

export const downloadVideo = (formData, win) => new Promise((resolve, reject) => {
	const { id, url, optimize, output, disableRateLimit } = formData

	const downloadCmd = ytdl([
		...disableRateLimit ? [] : ['--limit-rate',	'12500k'],
		'--output', `${scratchDisk.imports.path}/${id}.%(ext)s`,
		'--format', `${optimize === 'quality' ? `bestvideo[height<=${output}][fps<=60]+bestaudio/` : ''}best[height<=${output}][fps<=60]/best`,
		'--merge-output-format', 'mkv',
		url
	])

	const progress = {
		percent: '0%',
		eta: '00:00',
		id
	}

	downloadCmd.stdout.on('data', data => {
		const info = data.toString()

		if (!/\[download\]/.test(info)) return false

		progress.percent = parseYTDLOutput(info, /[.0-9]+%/) ?? progress.percent
		progress.eta = parseYTDLOutput(info, /[:0-9]+$/) ?? progress.eta

		win.webContents.send(`downloadProgress_${id}`, progress)
	})

	downloadCmd.stderr.on('data', err => {
		console.error(err)

		if (/^ERROR: Unable to download webpage/.test(err)) {
			reject(createDownloadError(url))
		}
	})

	downloadCmd.on('close', code => {
		if (code !== 0) return removeDownload(id)

		getTempFilePath(id).then(resolve)
	})

	downloadCmd.on('error', err => {
		console.error(err)
		reject(createDownloadError(url))
	})

	if (!downloads.has(id)) return cancelDownload(id)

	downloads.set(id, downloadCmd)

	win.webContents.send(`downloadStarted_${id}`)
})


/* --- GET TITLE --- */

const createURLError = url => new Error(`Error finding video at ${truncateUrl(url)}. The url may not be a supported service.`)

export const getURLInfo = ({ id, url, disableRateLimit }) => new Promise((resolve, reject) => {
	const infoCmd = ytdl([
		...disableRateLimit ? [] : ['--limit-rate',	'12500k'],
		'--dump-json',
		url
	])

	let infoString = ''

	infoCmd.stdout.on('data', data => {
		infoString = `${infoString}${data.toString()}`
	})

	infoCmd.stderr.on('data', err => {
		console.error(err)
		reject(createURLError(url))
	})

	infoCmd.on('close', code => {
		if (code !== 0) return removeDownload(id)

		let info = ''

		try {
			info = JSON.parse(infoString)
		} catch (err) {
			console.error(err)
			reject(createURLError(url))
		}

		resolve({
			title: info.title.replace(/\n/g, ''),
			isLive: info.is_live || info.protocol === 'm3u8'
		})
	})

	infoCmd.on('error', err => {
		console.error(err)
		reject(createURLError(url))
	})

	downloads.set(id, infoCmd)
})
