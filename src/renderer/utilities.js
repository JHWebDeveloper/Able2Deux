const { interop } = window.ABLE2

// ---- NUMBER METHODS --------

const countDigits = n => {
	let count = 0
	if (n >= 0) count++

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

export const zeroize = (n, base) => {
	const bl = countDigits(base) || 2
	const nl = countDigits(n)

	return `${'0'.repeat(bl - nl)}${n}`
}

const zeroize10 = n => n < 10 ? `0${n}` : n

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

const format12hr = d => {
	let h = d.getHours()
	const m = d.getMinutes()
	const meridian = h < 12 ? 'am' : 'pm'

	if (h === 0) h = 12
	if (h > 12) h -= 12

	return `${h}${zeroize10(m)}${meridian}`
}


// ---- STRING METHODS --------

export const capitalize = str => (
	`${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`
)

export const replaceTokens = (filename, i = 0, l = 0) => {
	const d = new Date()
	const z = l > 99 ? '00' : l > 10 ? '0' : ''

	return filename
		.replace(/\$n/g, `${z}${i + 1}`)
		.replace(/\$d/g, d.toDateString())
		.replace(/\$D/g, d.toLocaleDateString().replace(/\//g, '-'))
		.replace(/\$t/g, format12hr(d))
		.replace(/\$T/g, `${d.getHours()}${d.getMinutes()}`)
}


// ---- ARRAY METHODS --------

export const arrayCount = (arr, exp) => {
	let i = arr.length
	let count = 0

	while (i--) {
		if (exp(arr[i])) count += 1
	}

	return count
}


// ---- MISC --------

export const createSettingsMenu = actions => [
	{
		label: 'Copy Setting',
		action() { actions[0]() }
	},
	{
		label: 'Apply to All',
		action() { actions[1]() }
	}
]

export const compareProps = (prev, next) => {
	for (let key in prev) {
		if (typeof prev[key] === 'function' && typeof next[key] === 'function') continue

		if (prev[key] instanceof Object) {
			if (next[key] instanceof Object) {
				if (!compareProps(prev[key], next[key])) return false
			} else {
				return false
			}
		} else {
			if (prev[key] !== next[key]) return false
		}
	}

	return true
}

export const extractSettings = settings => {
	const  { arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return { arc, background, overlay, source, centering, position, scale, crop, rotation }
}

export const extractSettingsToArray = settings => {
	const  { start, arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return [ start, arc, background, overlay, source, centering, position, scale, crop, rotation ]
}

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

export const toastrOpts = {
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
}

export const warn = async ({ enabled, message, detail, callback }) => {
	let proceed = true

	if (enabled) {
		proceed = await interop.warning({ message, detail }) === 0
	}

	if (proceed) callback()
}

// const filterBadChars = (str, p1, p2, p3, p4) => {
//   if (p1) return 'and'
//   if (p2) return 'prc'
//   if (p3) return '2A'
//   if (p4) return encodeURIComponent(p4).replace(/%/g, '')
// }

// export const cleanFileName = fileName => fileName
//   .replace(/(&)|(%)|(\*)|(["/:;<>?\\`|ŒœŠšŸ​]|[^!-ż\s])/g, filterBadChars)
//   .slice(0, 286)
//   .replace(/^\s*|\s*$/g, '')
