const U = 'ArrowUp'
const D = 'ArrowDown'
const L = 'ArrowLeft'
const R = 'ArrowRight'
const A = 'a'
const B = 'b'
const START = 'Enter'

export const createKonamiListener = () => {
	const _keys = [ U, U, D, D, L, R, L, R, A, B, START ]
	let _count = 0
	let _callback = false

	const _log = e => {
		const match = e.key === _keys[_count]

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
