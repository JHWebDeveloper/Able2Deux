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

	if (h === 0) h = 12
	if (h > 12) h -= 12

	return `${h}${zeroize(m)}${meridian}`
}

export const secondsToTC = sec => [
	sec / 3600 << 0,
	sec / 60 % 60 << 0,
	sec % 60 << 0
].map(n => zeroize(n, 2)).join(':')

export const framesToTC = (frms, fps) => {
	const frmsPrec = frms * 10000
	const fpsPrec = fps * 10000
	const sec = Math.floor(frmsPrec / fpsPrec)
	const rmd = Math.floor(frmsPrec % fpsPrec / 10000)

	return `${secondsToTC(sec)}:${zeroizeAuto(rmd, fps)}`
}

export const tcToSeconds = hms => hms
	.split(':')
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
		.reduce((acc, val, i) => acc + val * 60 ** i, 0)

	frms *= fps

	if (parts[3]) frms += parts[3]

	return frms
}

export const limitTCChars = colonMax => e => {
	const colons = e.target.value.match(/:|;/g) || []
	const regex = colons.length === colonMax ? /[0-9]/ : /[:;0-9]/

	if (!regex.test(e.key)) e.preventDefault()
}

export const simplifyTimecode = tc => secondsToTC(tcToSeconds(tc))
