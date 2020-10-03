export const createPromiseQueue = (concurrent = 1) => {
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
		updateConcurrent(concurrent) {
			_concurrent = concurrent
			return this
		},
		add(id, fn) {
			const promise = async () => {
				await fn()
				_active--
				_next()
			}

			_queue.push({ id, promise })

			return this
		},
		remove(id) {
			_queue = _queue.filter(promise => promise.id !== id)
			return this
		},
		clear() {
			_queue = []
			return this
		},
		start() {
			_next()
			return this
		}	
	}
}
