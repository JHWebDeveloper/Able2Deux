import { TIME_UNIT_S, TIME_UNIT_L } from 'constants'
import { arrayInterlace, getIntegerLength } from 'utilities'

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

// unjoined zeroized values are needed in function framesToShortTC below. not the case for secondsToTC.
const framesToTCZeroized = (frms, fps) => framesToTCLiterals(frms, fps).map((n, i) => i === 3 ? zeroizeAuto(n, fps) : zeroize(n))

export const framesToTC = (frms, fps) => framesToTCZeroized(frms, fps).join(':')

export const framesToShortTC = (frms, fps) => arrayInterlace(framesToTCZeroized(frms, fps), TIME_UNIT_S).join('')

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

// ---- MISC. --------

export const capitalize = str => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`

export const errorToString = err => err.toString().replace(/^.*Error: /, '')

export const omitFromHistory = action => ({
	...action,
	payload: {
		...action.payload,
		omitFromHistory: true
	}
})

export const rgbToHex = ({ r, g, b }) => `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`

export const toPx = val => `${val}px`
