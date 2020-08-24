export const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`

const countDigits = n => {
	let count = 0
	if (n >= 0) count++

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

const getRegex = asperaSafe => (
	new RegExp(`(&)|(\\*)|([%"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')
)

const filterBadChars = (str, p1, p2, p3) => {
	if (p1) return 'and'
	if (p2) return '2A'
	if (p3) return encodeURIComponent(p3).replace(/%/g, '')
}

export const cleanFileName = (fileName, asperaSafe) => fileName
	.replace(getRegex(asperaSafe), filterBadChars)
	.slice(0, 280)
	.trim()

export const keepInRange = e => {
	const val = parseInt(e.target.value)
	const min = parseInt(e.target.min)
	const max = parseInt(e.target.max)
	let fixed = val

	if (val < min || val !== val) {
		fixed = min
	} else if (val > max) {
		fixed = max
	}

	e.target.value = fixed

	return e
}

export const zeroize = (n, base) => {
	const bl = countDigits(base) || 2
	const nl = countDigits(n)

	return `${'0'.repeat(bl - nl)}${n}`
}

export const zeroize10 = n => n < 10 ? `0${n}` : n

export const replaceTokens = (filename, i = 0, l = 0) => {
	const d = new Date()

	return filename
		.replace(/\$n/g, zeroize(i + 1, l))
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
