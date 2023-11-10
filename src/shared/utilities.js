// ---- CALCULATORS --------

const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

const degToRad = deg => deg * Math.PI / 180

const calcRotatedDimension = (w, h, trig1, trig2) => w * trig1 + h * trig2

const calcRotatedBoundingBox = (w, h, rad, dimension) => {
	const sin = Math.abs(Math.sin(rad))
	const cos = Math.abs(Math.cos(rad))

	switch (dimension) {
		case 'w':
			return calcRotatedDimension(w, h, cos, sin)
		case 'h':
			return calcRotatedDimension(w, h, sin, cos)
		default:
			return [
				calcRotatedDimension(w, h, cos, sin),
				calcRotatedDimension(w, h, sin, cos)
			]
	}
}

// ---- NUMBER METHOD EXTENSIONS --------

const getIntegerLength = n => {
	if (n < 0) n *= -1

	let count = 1

	while (n / 10 >= 1) {
		n /= 10
		count++
	}

	return count
}

// ---- OBJECT METHOD EXTENSIONS --------

const objectPick = (obj, props) => props.reduce((extract, prop) => {
	if (prop in obj) extract[prop] = obj[prop]
	return extract
}, {})

module.exports = {
	clamp,
	calcRotatedBoundingBox,
	degToRad,
	getIntegerLength,
	objectPick
}
