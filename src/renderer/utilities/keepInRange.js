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
