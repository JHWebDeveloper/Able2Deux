import { spawn } from 'child_process'
import { promises as fsp } from 'fs'
import path from 'path'
import ytdlStatic from 'youtube-dl-ffmpeg-ffprobe-static'
import ffmpegStatic from 'ffmpeg-static-electron'
import { fixPathForAsarUnpack } from 'electron-util'

import { scratchDisk } from '../scratchDisk'

const ytdlPath = fixPathForAsarUnpack(ytdlStatic.path)
const ffmpegPath = fixPathForAsarUnpack(ffmpegStatic.path)

let downloads = []

/* --- CANCEL DOWNLOAD --- */

export const cancelDownload = async id => {
	if (downloads.length) {
		await downloads.find(dl => dl.id === id).download.kill('SIGTERM')
	}

	return scratchDisk.imports.clear(id)
}

export const stopLiveDownload = async (id) => (
	downloads.find(dl => dl.id === id).download.kill('SIGINT')
)

const removeDownload = async id => {
	downloads = downloads.filter(dl => dl.id !== id)
}


/* --- DOWNLOAD --- */

const ytdlOpts = disableRateLimit => [
	...disableRateLimit ? [] : ['--limit-rate',	'12500k'],
	'--retries', '3',
	'--socket-timeout', '30',
	'--no-warnings',
	'--no-playlist'
]

const parseYTDLOutput = (str, regex) => {
	const result = str.match(regex)
	return result && result[0]
}

const getTempFilePath = async id => {
	const regex = new RegExp(`^${id}`)
	const files = await fsp.readdir(scratchDisk.imports.path)
	const file = files.find(f => regex.test(f))

	return path.join(scratchDisk.imports.path, file)
}

export const downloadVideo = (formData, win) => new Promise((resolve, reject) => {
	const { id, url, optimize, output, disableRateLimit } = formData
	let pending = true

	const download = spawn(ytdlPath, [
		...ytdlOpts(disableRateLimit),
		'--ffmpeg-location',	ffmpegPath,
		'--output', `${scratchDisk.imports.path}/${id}.%(ext)s`,
		'--format', `${optimize === 'quality' ? `bestvideo[height<=${output}][fps<=60]+bestaudio/` : ''}best[height<=${output}][fps<=60]/best`,
		url
	])

	const progress = {
		percent: '0%',
		eta: '00:00',
		id
	}

	download.stdout.on('data', data => {
		const info = data.toString()

		if (!/\[download\]/.test(info)) return false

		if (pending && /\[download\]\sDestination:/.test(info)) {
			win.webContents.send(`downloadStarted_${id}`)
			pending = false
		}

		progress.percent = parseYTDLOutput(info, /[.0-9]+%/) || progress.percent
		progress.eta = parseYTDLOutput(info, /[:0-9]+$/) || progress.eta

		win.webContents.send(`downloadProgress_${id}`, progress)
	})

	download.stderr.on('data', err => {
		if (/^ERROR: Unable to download webpage/.test(err)) {
			removeDownload(id)
			reject(err.toString())
		}
	})

	download.on('close', code => {
		removeDownload(id)
		if (code !== null) getTempFilePath(id).then(resolve)
	})

	download.on('error', err => {
		removeDownload(id)
		reject(err)
	})

	downloads.push({ id, download })
})


/* --- GET TITLE --- */

export const getURLInfo = ({ url, disableRateLimit }) => new Promise((resolve, reject) => {
	const info = spawn(ytdlPath, [
		...ytdlOpts(disableRateLimit), 
		'--dump-json',
		url
	])

	let infoString = ''

	info.stdout.on('data', data => {
		infoString += data.toString()
	})

	info.stderr.on('data', err => {
		info.kill()
		reject(err.toString())
	})

	info.on('close', code => {
		if (code === null) return false

		const { title, protocol, is_live = false } = JSON.parse(infoString)

		resolve({
			title: title.replace(/\n/g, ''),
			isLive: is_live || protocol === 'm3u8'
		})
	})

	info.on('error', err => {
		reject(err)
	})
})
