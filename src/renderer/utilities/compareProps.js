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
