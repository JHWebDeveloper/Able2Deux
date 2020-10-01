export const createPromiseQueue = concurrent => {
	let _concurrent = concurrent
	let _active = 0
	let _queue = []

	const _next = () => {
		while (_active < _concurrent && _queue.length) {
			_queue.shift().promise()
			_active++
		}
	}

	return {
		add(id, fn) {
			const promise = async () => {
				await fn()
				_active--
				_next()
			}

			_queue.push({ id, promise })
		},
		remove(id) {
			_queue = _queue.filter(promise => promise.id !== id)
		},
		clear() {
			_queue = []
		},
		start: _next
	}
}
