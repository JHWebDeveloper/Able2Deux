export const createKonamiListener = () => {
	const _keys = [38, 38, 40, 40, 37, 39, 37, 39, 65, 66, 13]
	let _count = 0
	let _callback = false

	const _log = e => {
		const match = e.keyCode === _keys[count]

		if (match && _count === _keys.length - 1) {
			_callback()
			_count = 0
		} else if (match) {
			_count += 1
		} else {
			_count = 0
		}
	}

	return {
		listen(callback) {
			_callback = callback
			window.addEventListener('keydown', _log)
		},
		remove() {
			_callback = false
			window.removeEventListener('keydown', _log)
		}
	}
}
