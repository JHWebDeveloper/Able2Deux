import { arrayInterlace, getIntegerLength } from 'utilities'

// ---- CONSTANTS --------

const TIME_UNIT_L = Object.freeze(['hour', 'minute', 'second', 'frame'])
const TIME_UNIT_S = Object.freeze(TIME_UNIT_L.map(u => u[0]))

// ---- ZERO PADDERS --------

export const zeroize = (n, zeroes = 2) => n
	.toString()
	.padStart(zeroes, '0')

export const zeroizeAuto = (n, total) => zeroize(n, getIntegerLength(total))

// ---- TIMECODES AND TIMESTAMPS --------

const framesToTCLiterals = (frms, fps) => {
	const frmsPrec = frms * 1e4
	const fpsPrec = fps * 1e4
	const sec = Math.floor(frmsPrec / fpsPrec)
	const rmd = Math.floor(frmsPrec % fpsPrec / 1e4)

	return [...secondsToTCLiterals(sec), rmd]
}

const secondsToTCLiterals = sec => [
	sec / 3600,
	sec / 60 % 60,
	sec % 60
].map(lit => lit | 0) // using bitwise or to floor values

// unjoined zeroized values are needed in function getTokenReplacerFns below. not the case for secondsToTC.
const framesToTCZeroized = (frms, fps) => framesToTCLiterals(frms, fps).map((n, i) => i === 3 ? zeroizeAuto(n, fps) : zeroize(n))

export const framesToTC = (frms, fps) => framesToTCZeroized(frms, fps).join(':')

export const secondsToTC = sec => secondsToTCLiterals(sec)
	.map(n => zeroize(n, 2))
	.join(':')

const pluralizeUnit = (t, u) => t === 1 ? u : `${u}s`

export const framesToAudibleTC = (frms, fps) => arrayInterlace(secondsToTCLiterals(frms, fps), TIME_UNIT_L, pluralizeUnit).join(' ')

export const secondsToAudibleTC = sec => arrayInterlace(secondsToTCLiterals(sec), TIME_UNIT_L, pluralizeUnit).join(' ')

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

export const tcToSeconds = hms => hms
	.split(/:|;/)
	.reverse()
	.map(val => parseInt(val) || 0)
	.reduce((acc, val, i) => acc + val * 60 ** i, 0)

// ---- FILE NAMES --------

const getAsperaSafeRegex = asperaSafe => new RegExp(`([%&"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')

export const cleanFilename = (fileName, asperaSafe) => fileName
	.replace(getAsperaSafeRegex(asperaSafe), '_')
	.trim()
	.slice(0, 252)
	.trimEnd()

export const format12hr = d => {
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

const getTokenReplacerFns = (i, l, { start, end, duration, fps, instances= [], versions = [], refId, id }) => {
	const d = new Date()

	return new Map(Object.entries({
		'$d': () => d.toDateString(),
		'$D': () => d.toLocaleDateString().replace(/\//g, '-'),
		'$t': () => format12hr(d),
		'$T': () => `${d.getHours()}${d.getMinutes()}`,
		'$i': () => zeroizeAuto(instances.indexOf(refId) + 1, instances.length),
		'$v': () => zeroizeAuto(versions.indexOf(id) + 1, versions.length),
		'$n': () => zeroizeAuto(i + 1, l),
		'$li': () => instances.length,
		'$lv': () => versions.length,
		'$l': () => l,
		'$s': () => arrayInterlace(framesToTCZeroized(start, fps), TIME_UNIT_S).join(''),
		'$e': () => arrayInterlace(framesToTCZeroized(end, fps), TIME_UNIT_S).join(''),
		'$r': () => arrayInterlace(framesToTCZeroized(duration * fps, fps), TIME_UNIT_S).join(''),
		'$c': () => arrayInterlace(framesToTCZeroized(end - start, fps), TIME_UNIT_S).join('')
	}))
}

const removeEscapeChars = filename => filename.replace(/\\(?=\$(d|D|t|T|n|i|v|l(i|v)?|s|e|r|c))/g, '')

export const replaceTokens = (filename, i = 0, media) => {
	if (filename.length < 2) return filename

	const matches = [...new Set(filename.match(/(?<!\\)\$(d|D|t|T|n|i|v|l(i|v)?|s|e|r|c)/g))].sort().reverse()

	if (!media.length) return removeEscapeChars(filename)

	const item = media[i]

	if (matches.includes('$i') || matches.includes('$li')) {
		item.instances = [...new Set(media.map(({ refId }) => refId))]
	}

	if (matches.includes('$v') || matches.includes('$lv')) {
		item.versions = media.reduce((acc, { refId, id }) => {
			if (refId === item.refId) acc.push(id)
			return acc
		}, [])
	}

	const replacer = getTokenReplacerFns(i, media.length, item)
	
	for (const match of matches) {
		filename = filename.replace(new RegExp(`(?<!\\\\)\\${match}`, 'g'), replacer.get(match)())
	}

	return removeEscapeChars(filename)
}

// ---- MISC. --------

export const capitalize = str => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

export const rgbToHex = ({ r, g, b }) => `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`

export const toPx = val => `${val}px`
