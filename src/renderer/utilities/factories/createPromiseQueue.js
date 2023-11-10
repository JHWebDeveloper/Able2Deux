import { v1 as uuid } from 'uuid'

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
		add(fn, id) {
			_queue.push({
				id,
				async promise() {
					await fn()
					_active--
					_next()
				}
			})

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
