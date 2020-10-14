import { getIntegerLength } from '.'

export const capitalize = str => {
	const len = str.length
	let newStr = str[0].toUpperCase()

	for (let i = 1; i < len; i++) {
		newStr += str[i].toLowerCase()
	}

	return newStr
}

const getRegex = asperaSafe => new RegExp(`([%&"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')

export const cleanFilename = (fileName, asperaSafe) => fileName
	.replace(getRegex(asperaSafe), '_')
	.trim()
	.slice(0, 252)
	.trimEnd()

export const keepInRange = e => {
	let { value, dataset, min, max } = e.target

	value = value === '' ? parseFloat(dataset.defaultValue) : parseFloat(value)
	min = parseFloat(min)
	max = parseFloat(max)

	e.target.value = Math.max(min, Math.min(max, value))

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
		.replace(/\$r/g, zeroize(l - i, l))
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

export const secondsToTC = sec => [
	sec / 3600 << 0,
	sec / 60 % 60 << 0,
	sec % 60 << 0
].map(zeroize10).join(':')

export const tcToSeconds = hms => {
	const sec = hms
		.split(':')
		.reverse()
		.map(val => parseInt(val) || 0)
		.reduce((acc, val, i) => acc + val * 60 ** i, 0)
	
	return Math.min(sec, 86399) // 86399 == 23:59:59
}

export const simplifyTimecode = tc => secondsToTC(tcToSeconds(tc))
