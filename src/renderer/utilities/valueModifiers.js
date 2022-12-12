import { getIntegerLength } from '.'

export const capitalize = str => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

const getRegex = asperaSafe => new RegExp(`([%&"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')

export const cleanFilename = (fileName, asperaSafe) => fileName
	.replace(getRegex(asperaSafe), '_')
	.trim()
	.slice(0, 252)
	.trimEnd()

export const zeroizeAuto = (n, total) => zeroize(n, getIntegerLength(total))

export const zeroize = (n, zeroes = 2) => n
	.toString()
	.padStart(zeroes, '0')

export const replaceTokens = (filename, i = 0, l = 0) => {
	const d = new Date()

	return filename
		.replace(/\$n/g, zeroizeAuto(i + 1, l))
		.replace(/\$r/g, zeroizeAuto(l - i, l))
		.replace(/\$b/g, l)
		.replace(/\$d/g, d.toDateString())
		.replace(/\$D/g, d.toLocaleDateString().replace(/\//g, '-'))
		.replace(/\$t/g, format12hr(d))
		.replace(/\$T/g, `${d.getHours()}${d.getMinutes()}`)
}

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

export const secondsToTC = sec => [
	sec / 3600,
	sec / 60 % 60,
	sec % 60
].map(n => zeroize(n | 0, 2)).join(':')

export const framesToTC = (frms, fps) => {
	const frmsPrec = frms * 1e4
	const fpsPrec = fps * 1e4
	const sec = Math.floor(frmsPrec / fpsPrec)
	const rmd = Math.floor(frmsPrec % fpsPrec / 1e4)

	return `${secondsToTC(sec)}:${zeroizeAuto(rmd, fps)}`
}

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

export const simplifyAspectRatio = (ant = 1, con = 1) => {
	const ratio = Number(parseFloat(con / ant).toFixed(12))
	const inverse = Number(parseFloat(ant / con).toFixed(12))

	if (Number.isInteger(ratio)) {
		return [inverse * ratio, ratio]
	}

	if (Number.isInteger(inverse)) {
		return [inverse, inverse * ratio]
	}

	while (ant < 1 || con < 1) {
		ant *= 10
		con *= 10
	}

	return [ant, con]
}
