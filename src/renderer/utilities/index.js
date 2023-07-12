export * from './buildSource'
export * from './componentHelpers'
export * from './CSPL'
export * from './drawAble2Logo'
export * from './factories'
export * from './valueModifiers'
export * from '../../shared/utilities'

// ---- CONSTANTS --------

export const TAU = Math.PI * 2

export const toastrOpts = {
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
}

// ---- CALCULATORS/CONVERTERS --------

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

export const errorToString = err => err.toString().replace(/^.*Error: /, '')

export const pythagorean = (a, b) => a ** 2 + b ** 2 // omitting square root for performance

// ---- ARRAY UTIL. --------

export const arrayCount = (arr, exp) => {
	let i = arr.length
	let count = 0

	while (i--) {
		if (exp(arr[i])) count += 1
	}

	return count
}

export const findNearestIndex = (arr, startIndex, condition, fallback = -1) => {
	const len = arr.length - 1
	let next = startIndex
	let prev = startIndex

	while (next < len && prev) {
		next++
		if (condition(arr[next])) return next
		prev--
		if (condition(arr[prev])) return prev
	}

	while (next++ < len) {
		if (condition(arr[next])) return next
	}

	while (prev--) {
		if (condition(arr[prev])) return prev
	}

	return fallback
}

export const group = (arr, groupKey) => Object.values(arr.reduce((acc, obj) => {
	if (!(groupKey in obj)) return acc

	const groupKeyValue = obj[groupKey]

	if (groupKeyValue in acc) {
		acc[groupKeyValue].push(obj)
	} else {
		acc[groupKeyValue] = [obj]
	}

	return acc
}, {}))

// ---- FUNCTION UTIL. --------

export const pipe = (...fns) => val => fns.reduce((acc, fn) => fn(acc), val)

export const pipeAsync = (...fns) => val => fns.reduce((chain, fn) => chain.then(fn), Promise.resolve(val))

export const debounce = (callback, wait) => {
	let timeout = false

	return (...args) => {
		clearTimeout(timeout)

		timeout = setTimeout(() => {
			clearTimeout(timeout)
			callback(...args)
		}, wait)
	}
}

export const throttle = (callback, duration) => {
	let shouldWait = false
	
	return (...args) => {
		if (!shouldWait) {
			callback(...args)
			
			shouldWait = true
			
			setTimeout(() => {
				shouldWait = false
			}, duration)
		}
	}
}

// ---- ACCESSIBILITY --------

export const initTabbedBrowsing = () => {
	function onKeyDown(e) {
		if (e.key !== 'Tab') return true
		
		this.className = 'accessible'
		this.removeEventListener('keydown', onKeyDown)
	}

	document.body.addEventListener('keydown', onKeyDown)
}
