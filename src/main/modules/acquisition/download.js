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
		await downloads.find(dl => dl.id === id).cmd.kill('SIGTERM')
	}

	return scratchDisk.imports.clear(id)
}

export const stopLiveDownload = async id => downloads.find(dl => dl.id === id).cmd.kill('SIGINT')

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
	return result?.[0]
}

const getTempFilePath = async id => {
	const regex = new RegExp(`^${id}`)
	const files = await fsp.readdir(scratchDisk.imports.path)
	const file = files.find(f => regex.test(f))

	return path.join(scratchDisk.imports.path, file)
}

export const downloadVideo = (formData, win) => new Promise((resolve, reject) => {
	const { id, url, optimize, output, disableRateLimit } = formData

	const downloadCmd = spawn(ytdlPath, [
		...ytdlOpts(disableRateLimit),
		'--ffmpeg-location',	ffmpegPath,
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
		if (/^ERROR: Unable to download webpage/.test(err)) {
			reject(err.toString())
		}
	})

	downloadCmd.on('close', code => {
		if (code !== 0) return removeDownload(id)

		getTempFilePath(id).then(resolve)
	})

	downloadCmd.on('error', err => {
		reject(err)
	})

	const index = downloads.findIndex(dl => dl.id === id)

	if (index < 0) return cancelDownload(id)

	downloads[index].cmd = downloadCmd

	win.webContents.send(`downloadStarted_${id}`)
})


/* --- GET TITLE --- */

export const getURLInfo = ({ id, url, disableRateLimit }) => new Promise((resolve, reject) => {
	const infoCmd = spawn(ytdlPath, [
		...ytdlOpts(disableRateLimit), 
		'--dump-json',
		url
	])

	let infoString = ''

	infoCmd.stdout.on('data', data => {
		infoString += data.toString()
	})

	infoCmd.stderr.on('data', err => {
		reject(err.toString())
	})

	infoCmd.on('close', code => {
		if (code !== 0) return removeDownload(id)

		let info = ''

		try {
			info = JSON.parse(infoString)
		} catch (err) {
			reject(err)
		}

		resolve({
			title: info.title.replace(/\n/g, ''),
			isLive: info.is_live || info.protocol === 'm3u8'
		})
	})

	infoCmd.on('error', err => {
		reject(err)
	})

	downloads.push({ id, cmd: infoCmd })
})
