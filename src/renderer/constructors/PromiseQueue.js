export class PromiseQueue {
	constructor(concurrent) {
		this.concurrent = concurrent
		this.active = 0
		this.queue = []
	}

	next() {
		while (this.active < this.concurrent && this.queue.length) {
			this.active++

			const nextPromise = this.queue.shift()

			nextPromise.promise()
		}
	}

	add(id, promise) {
		this.queue.push({
			id,
			promise: async () => {
				await promise()
				this.active--
				this.next()
			}
		})
	}

	remove(id) {
		this.queue = this.queue.filter(promise => promise.id !== id)
	}

	clear() {
		this.queue = []
	}

	start() {
		this.next()
	}
}
