import * as STATUS from './status/types'

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

export const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`

const filterBadChars = (str, p1, p2, p3, p4) => {
	if (p1) return 'and'
	if (p2) return 'prc'
	if (p3) return '2A'
	if (p4) return encodeURIComponent(p4).replace(/%/g, '')
}

export const cleanFileName = fileName => fileName
	.replace(/(&)|(%)|(\*)|(["/:;<>?\\`|ŒœŠšŸ​]|[^!-ż\s])/g, filterBadChars)
	.slice(0, 280)
	.trim()

export const replaceTokens = (filename, i = 0, l = 0) => {
	const d = new Date()

	return filename
		.replace(/\$n/g, zeroize(i + 1, l))
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
	for (const key in prev) {
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

export const getStatusColor = status => {
	switch (status) {
		case STATUS.DOWNLOADING:
		case STATUS.LOADING:
		case STATUS.RENDERING:
			return '#fcdb03'
		case STATUS.READY:
		case STATUS.COMPLETE:
			return '#0cf700'
		case STATUS.CANCELLING:
			return '#ff8000'
		case STATUS.FAILED:
		case STATUS.CANCELLED:
			return '#ff4800'
		default:
			return '#bbb'
	}
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

export const initTabbedBrowsing = () => {
	document.body.onkeydown = function (e) {
		if (e.keyCode !== 9) return
		
		this.className = 'accessible'
		this.onkeydown = false
	}
}

export const TAU = Math.PI * 2

export const drawAble2Logo = ctx => {
	ctx.strokeStyle = '#444444'
	ctx.lineWidth = 24
	ctx.beginPath()
	ctx.arc(212, 212, 200, 0, TAU, false)
	ctx.stroke()

	// generated at http://demo.qunee.com/svg2canvas/
	ctx.strokeStyle = 'transparent'
	ctx.fillStyle = '#444444'
	ctx.beginPath()
	ctx.moveTo(212, 23.308)
	ctx.bezierCurveTo(204.683, 23.308, 197.462, 23.725, 190.361, 24.536)
	ctx.lineTo(56.898, 319.49)
	ctx.bezierCurveTo(64.363, 330.242, 72.91900000000001, 340.17900000000003, 82.404, 349.144)
	ctx.lineTo(141.655, 216.588)
	ctx.lineTo(141.679, 216.607)
	ctx.bezierCurveTo(163.728, 185.899, 184.2, 169.363, 215.695, 169.363)
	ctx.bezierCurveTo(245.61599999999999, 169.363, 271.206, 189.835, 271.206, 222.119)
	ctx.bezierCurveTo(271.206, 249.679, 255.85200000000003, 270.938, 213.72700000000003, 308.733)
	ctx.lineTo(127.71100000000003, 380.86400000000003)
	ctx.bezierCurveTo(137.72800000000004, 385.874, 148.25200000000004, 390.01700000000005, 159.187, 393.19800000000004)
	ctx.lineTo(233.80400000000003, 327.237)
	ctx.bezierCurveTo(267.398, 298.012, 287.908, 277.124, 297.32700000000006, 253.66500000000002)
	ctx.lineTo(340.25200000000007, 350.404)
	ctx.bezierCurveTo(350.27400000000006, 341.112, 359.2850000000001, 330.747, 367.10300000000007, 319.489)
	ctx.lineTo(233.641, 24.536)
	ctx.bezierCurveTo(226.539, 23.725, 219.318, 23.308, 212, 23.308)
	ctx.closePath()
	ctx.moveTo(218.059, 141.41)
	ctx.bezierCurveTo(199.537, 141.41, 184.31, 144.588, 171.163, 150.57)
	ctx.lineTo(211.519, 60.28299999999999)
	ctx.lineTo(249.72500000000002, 146.387)
	ctx.bezierCurveTo(240.065, 143.167, 229.431, 141.41, 218.059, 141.41)
	ctx.closePath()
	ctx.fill()
	ctx.stroke()
}
