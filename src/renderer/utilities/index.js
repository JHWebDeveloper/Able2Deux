export * from './buildSource'
export * from './componentHelpers'
export * from './drawAble2Logo'
export * from './valueModifiers'

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

export const throttle = (callback, wait) => {
	let timeout = false
	let initialCall = true

	return (...args) => {
		const caller = () => {
			callback(...args)
			timeout = false
		}

		if (initialCall) {
			initialCall = false
			caller()
		}

		if (!timeout) {
			timeout = setTimeout(caller, wait)
		}
	}
}

export const arrayCount = (arr, exp) => {
	let i = arr.length
	let count = 0

	while (i--) {
		if (exp(arr[i])) count += 1
	}

	return count
}

export const countDigits = n => {
	let count = 0
	if (n >= 0) count++

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

export const initTabbedBrowsing = () => {
	document.body.onkeydown = function (e) {
		if (e.keyCode !== 9) return
		
		this.className = 'accessible'
		this.onkeydown = false
	}
}

export const toastrOpts = {
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
}
