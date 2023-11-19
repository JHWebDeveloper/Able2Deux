export * from './buildSource'
export * from './componentHelpers'
export * from './CSPL'
export * from './drawAble2Logo'
export * from './factories'
export * from './mediaData'
export * from './objectPickers'
export * from './presets'
export * from './valueModifiers'
export * from '../../shared/utilities'

// ---- CALCULATORS --------

export const pythagorean = (a, b) => a ** 2 + b ** 2 // omitting square root for performance

// ---- ARRAY METHOD EXTENSIONS --------

export const arrayCount = (arr, exp) => {
	let i = arr.length
	let count = 0

	while (i--) {
		if (exp(arr[i], i)) count++
	}

	return count
}

export const arrayInterlace = (arrL, arrR, mod) => arrL.reduce((acc, val, i) => {
	if (arrR[i]) {
		acc.push(val, mod instanceof Function ? mod(val, arrR[i]) : arrR[i])
	}

	return acc
}, [])

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

// ---- OBJECT METHOD EXTENSIONS --------

const isFunction = obj => typeof obj === 'function'
const isObject = obj => obj !== null && typeof obj === 'object'

export const objectsAreEqual = (objL, objR) => {
	const keysL = Object.keys(objL)
	const keysR = Object.keys(objR)
	
	if (keysL.length !== keysR.length) return false

	for (const key of keysL) {
		const valL = objL[key]
		const valR = objR[key]

		if (isFunction(valL) && isFunction(valR)) continue

		const bothObjects = isObject(valL) && isObject(valR)

		if (!bothObjects && valL !== valR || bothObjects && !objectsAreEqual(valL, valR)) return false
	}

	return true
}

export const constrainPairedValue = (keyA, keyB, movingRight, buffer = 0.1) => {
	const constrainFn = movingRight
		? (v1, v2) => v1 >= v2 ? v2 - buffer : v1
		: (v1, v2) => v1 <= v2 ? v2 + buffer : v1

	return (item, value) => ({
		[keyA]: constrainFn(value, item[keyB])
	})
}

// ---- FUNCTION UTILITIES --------

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
