export * from './buildSource'
export * from './componentHelpers'
export * from './drawAble2Logo'
export * from './factories'
export * from './valueModifiers'

export const arrayCount = (arr, exp) => {
	let i = arr.length
	let count = 0

	while (i--) {
		if (exp(arr[i])) count += 1
	}

	return count
}

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

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

export const errorToString = err => err.toString().replace(/^.*Error: /, '')

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

export const getIntegerLength = n => {
	if (n < 0) n *= -1

	let count = 1

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

export const initTabbedBrowsing = () => {
	function onKeyDown(e) {
		if (e.key !== 'Tab') return true
		
		this.className = 'accessible'
		this.removeEventListener('keydown', onKeyDown)
	}

	document.body.addEventListener('keydown', onKeyDown)
}

export const objectExtract = (obj, props) => props.reduce((extract, prop) => ({
	...extract,
	[prop]: obj[prop]
}), {})

export const toastrOpts = {
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
}
