export * from './buildSource'
export * from './componentHelpers'
export * from './CSPL'
export * from './drawAble2Logo'
export * from './factories'
export * from './valueModifiers'

// ---- constants ---- //

export const TAU = Math.PI * 2

export const toastrOpts = {
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
}

// ---- calculators and converters ---- //

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

export const degToRad = deg => deg * Math.PI / 180

const calcRotW = (w, h, sin, cos) => w * cos + h * sin
const calcRotH = (w, h, sin, cos) => w * sin + h * cos

export const calculateRotatedBoundingBox = (w, h, rad, dimension) => {
	const sin = Math.abs(Math.sin(rad))
	const cos = Math.abs(Math.cos(rad))

  switch (dimension) {
    case 'w':
      return calcRotW(w, h, sin, cos)
    case 'h':
      return calcRotH(w, h, sin, cos)
    default:
      return [
        calcRotW(w, h, sin, cos),
        calcRotH(w, h, sin, cos)
      ]
  }
}

export const errorToString = err => err.toString().replace(/^.*Error: /, '')

export const getIntegerLength = n => {
	if (n < 0) n *= -1

	let count = 1

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

export const pythagorean = (a, b) => a ** 2 + b ** 2 // omitting square root for performance


// ---- array utilities ---- //

export const arrayCount = (arr, exp) => {
	let i = arr.length
	let count = 0

	while (i--) {
		if (exp(arr[i])) count += 1
	}

	return count
}

// ---- object utilities ---- //

export const objectExtract = (obj, props) => props.reduce((extract, prop) => ({
	...extract,
	[prop]: obj[prop]
}), {})

// ---- function utilities ---- //

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

// ---- acessibility ---- //

export const initTabbedBrowsing = () => {
	function onKeyDown(e) {
		if (e.key !== 'Tab') return true
		
		this.className = 'accessible'
		this.removeEventListener('keydown', onKeyDown)
	}

	document.body.addEventListener('keydown', onKeyDown)
}
