import { promises as fsp } from 'fs'
import path from 'path'

import { ytdlp } from '../binaries'
import { scratchDisk } from '../scratchDisk'

const downloads = new Map()

const truncateURL = (url, limit = 100) => url.length > limit ? `${url.slice(0, 96)}...` : url

// ---- CANCEL DOWNLOAD --------

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

// ---- DOWNLOAD --------

const getTempFilePath = async id => {
	const regex = new RegExp(`^${id}`)
	const files = await fsp.readdir(scratchDisk.imports.path)
	const file = files.find(f => regex.test(f))

	return path.join(scratchDisk.imports.path, file)
}

const createDownloadError = url => new Error(`An error occured while downloading from ${truncateURL(url)}.`)

const convertNumericString = (str, fb) => isNaN(str) ? fb : parseFloat(str)

export const downloadVideo = (formData, win) => new Promise((resolve, reject) => {
	const { id, url, optimize, output, disableRateLimit } = formData
	const cmdPrefixRegex = new RegExp(`^\r\\[${id}\\]_`)

	const downloadCmd = ytdlp([
		...disableRateLimit ? [] : ['--limit-rate',	'12500k'],
		'--output', `${scratchDisk.imports.path}/${id}.%(ext)s`,
		'--format', `${optimize === 'quality' ? `bestvideo[height<=${output}][fps<=60]+bestaudio/` : ''}best[height<=${output}][fps<=60]/best`,
		'--merge-output-format', 'mkv',
		'--progress-template', `[${id}]_{"downloaded":"%(progress.downloaded_bytes)s","total":"%(progress.total_bytes)s","totalEst":"%(progress.total_bytes_estimate)s","eta":"%(progress.eta)s"}`,
		url
	])

	const progress = {
		downloaded: 0,
		total: 1,
		eta: 0,
		id
	}

	downloadCmd.stdout.on('data', data => {
		const info = data.toString()

		if (!cmdPrefixRegex.test(info)) return false

		const [ json ] = info.match(/{.*}/)

		const { downloaded, total, totalEst, eta } = JSON.parse(json)
		progress.downloaded = convertNumericString(downloaded, progress.downloaded)
		progress.total = convertNumericString(total, convertNumericString(totalEst, progress.total))
		progress.eta = convertNumericString(eta, progress.eta)
		
		win.webContents.send(`downloadProgress_${id}`, {
			percent: progress.downloaded / progress.total,
			eta: progress.eta,
			id
		})
	})

	downloadCmd.stderr.on('data', err => {
		console.error(err.toString())
		downloadCmd.kill()

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
		downloadCmd.kill()
		reject(createDownloadError(url))
	})

	if (!downloads.has(id)) return cancelDownload(id)

	downloads.set(id, downloadCmd)

	win.webContents.send(`downloadStarted_${id}`)
})

// ---- GET TITLE --------

const createURLError = url => new Error(`Error finding video at ${truncateURL(url)}. The url may not be a supported service.`)

export const getURLInfo = ({ id, url, disableRateLimit }) => new Promise((resolve, reject) => {
	const infoCmd = ytdlp([
		...disableRateLimit ? [] : ['--limit-rate',	'12500k'],
		'--dump-json',
		url
	])

	let infoString = ''

	infoCmd.stdout.on('data', data => {
		infoString = `${infoString}${data.toString()}`
	})

	infoCmd.stderr.on('data', err => {
		console.error(err.toString())
		infoCmd.kill()
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
		infoCmd.kill()
		reject(createURLError(url))
	})

	downloads.set(id, infoCmd)
})
