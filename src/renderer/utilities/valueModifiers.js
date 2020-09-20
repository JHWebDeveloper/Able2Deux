import { getIntegerLength } from '.'

export const capitalize = str => {
	const len = str.length
	let newStr = str[0].toUpperCase()

	for (let i = 1; i < len; i++) {
		newStr += str[i].toLowerCase()
	}

	return newStr
}

const getRegex = asperaSafe => (
	new RegExp(`([%&"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')
)

export const cleanFilename = (fileName, asperaSafe) => fileName
	.replace(getRegex(asperaSafe), '_')
	.slice(0, 251)
	.trim()

export const keepInRange = e => {
	const val = parseFloat(e.target.value)
	const min = parseFloat(e.target.min)
	const max = parseFloat(e.target.max)
	let fixed = val

	if (val < min || val !== val) {
		fixed = min
	} else if (val > max) {
		fixed = max
	}

	e.target.value = fixed

	return e
}

export const zeroize = (n = 1, total = 1) => {
	if (total < 9) return n
	
	let zeroCount = getIntegerLength(total) - getIntegerLength(n)

	while (zeroCount--) n = `0${n}`

	return n
}

export const zeroize10 = n => n < 10 ? `0${n}` : n

export const replaceTokens = (filename, i = 0, l = 0) => {
	const d = new Date()

	return filename
		.replace(/\$n/g, zeroize(i + 1, l))
		.replace(/\$r/g, zeroize(l - (i + 1), l))
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

	return `${h}${zeroize10(m)}${meridian}`
}

export const secondsToTC = secs => [
	Math.floor(secs / 3600),
	Math.floor(secs / 60) % 60,
	Math.floor(secs % 60)
].map(zeroize10).join(':')

const mult = [1, 60, 3600]

export const tcToSeconds = hms => {
	const secs = hms
		.split(':')
		.reverse()
		.map(val => parseInt(val) || 0)
		.reduce((acc, val, i) => acc + val * mult[i], 0)
	
	return Math.min(secs, 86399)
}

export const simplifyTimecode = tc => secondsToTC(tcToSeconds(tc))
