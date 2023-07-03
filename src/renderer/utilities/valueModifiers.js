import { v1 as uuid } from 'uuid'

import { getIntegerLength } from 'utilities'

// ---- CURVE ARRYS --------

export const copyCurve = curve => curve.map(pt => ({ ...pt, id: uuid() }))

export const copyCurveSet = curves => {
	const [ rgb, r, g, b ] = [
		curves.rgb,
		curves.r,
		curves.g,
		curves.b
	].map(c => copyCurve(c))

	return { ...curves, rgb, r, g, b }
}

export const createColorCurvesCopier = ({ colorCurves }) => () => ({
	colorCurves: copyCurveSet(colorCurves)
})

export const sortCurvePoints = (a, b) => a.x - b.x

// ---- ZERO PADDERS --------

export const zeroize = (n, zeroes = 2) => n
	.toString()
	.padStart(zeroes, '0')

export const zeroizeAuto = (n, total) => zeroize(n, getIntegerLength(total))

// ---- TIMECODES AND TIMESTAMPS --------

const secondsToTCLiterals = sec => [
	sec / 3600,
	sec / 60 % 60,
	sec % 60
].map(lit => lit | 0) // using bitwise or to floor values

const framesToTCLiterals = (frms, fps) => {
	const frmsPrec = frms * 1e4
	const fpsPrec = fps * 1e4
	const sec = Math.floor(frmsPrec / fpsPrec)
	const rmd = Math.floor(frmsPrec % fpsPrec / 1e4)

	return [...secondsToTCLiterals(sec), rmd]
}

export const secondsToTC = sec => secondsToTCLiterals(sec)
	.map(n => zeroize(n, 2))
	.join(':')

export const framesToTC = (frms, fps) => framesToTCLiterals(frms, fps)
	.map((n, i) => i === 3 ? zeroizeAuto(n, fps) : zeroize(n))
	.join(':')

const timeUnit = ['hour', 'minute', 'second', 'frame']

export const secondsToAudibleTC = sec => secondsToTCLiterals(sec)
	.reduce((tc, n, i) => [...tc, n, `${timeUnit[i]}${n === 1 ? '' : 's'},`], [])
	.join(' ')

export const framesToAudibleTC = (frms, fps) => framesToTCLiterals(frms, fps)
	.reduce((tc, n, i) => [...tc, n, `${timeUnit[i]}${n === 1 ? '' : 's'},`], [])
	.join(' ')

export const tcToSeconds = hms => hms
	.split(/:|;/)
	.reverse()
	.map(val => parseInt(val) || 0)
	.reduce((acc, val, i) => acc + val * 60 ** i, 0)

export const tcToFrames = (hmsf, fps) => {
	const parts = hmsf
		.split(/:|;/)
		.map(val => parseInt(val) || 0)

	let frms = parts
		.slice(0, 3)
		.reverse()
		.reduce((acc, val, i) => acc + val * 60 ** i * fps, 0)
		
	if (parts[3]) frms += parts[3]

	return frms
}

// ---- FILE NAMES --------

const getAsperaSafeRegex = asperaSafe => new RegExp(`([%&"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')

export const cleanFilename = (fileName, asperaSafe) => fileName
	.replace(getAsperaSafeRegex(asperaSafe), '_')
	.trim()
	.slice(0, 252)
	.trimEnd()

const format12hr = d => {
	let h = d.getHours()
	const m = d.getMinutes()
	const meridian = h < 12 ? 'am' : 'pm'

	if (h > 12) {
		h -= 12
	} else if (h === 0) {
		h = 12
	}

	return `${h}${zeroize(m)}${meridian}`
}

const replaceBackground = bg => {
	switch (bg) {
		case 'blue':
		case 'grey':
			return 'EWN'
		case 'light_blue':
		case 'dark_blue':
		case 'teal':
		case 'tan':
			return 'TNT'
		default:
			return ''
	}
}

const getReplacerFns = (i, l, { start, end, duration, fps, background }) => {
	const d = new Date()

	return new Map(Object.entries({
		'$d': () => d.toDateString(),
		'$D': () => d.toLocaleDateString().replace(/\//g, '-'),
		'$t': () => format12hr(d),
		'$T': () => `${d.getHours()}${d.getMinutes()}`,
		'$n': () => zeroizeAuto(i + 1, l),
		'$l': () => l,
		'$s': () => secondsToTC(Math.round(start / fps)).split(':').join(''),
		'$e': () => secondsToTC(Math.round(end / fps)).split(':').join(''),
		'$r': () => secondsToTC(Math.round(duration)).split(':').join(''),
		'$c': () => secondsToTC(Math.round((end - start) / fps)).split(':').join(''),
		'$9': () => replaceBackground(background)
	}))
}

export const replaceTokens = (filename, i = 0, l = 0, media = {}) => {
	if (filename.length < 2) return filename

	const matches = [...new Set(filename.match(/(?<!\\)\$(d|D|t|T|n|l|s|e|r|c|9)/g))].sort().reverse()

	if (matches.length) {
		const replacer = getReplacerFns(i, l, media)
	
		for (const match of matches) {
			filename = filename.replace(new RegExp(`(?<!\\\\)\\${match}`, 'g'), replacer.get(match)())
		}
	}

	return filename.replace(/\\(?=\$(d|D|t|T|n|l|s|e|r|c|9))/g, '')
}

// ---- MISC. --------

export const capitalize = str => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

export const rgbToHex = ({ r, g, b }) => `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
