export class Konami {
	constructor() {
		this.keys = [38, 38, 40, 40, 37, 39, 37, 39, 65, 66, 13]
		this.count = 0
		this.callback = false
	}

	log = e => {
		const match = e.keyCode === this.keys[this.count]

		if (match && this.count === this.keys.length - 1) {
			this.callback()
			this.count = 0
		} else if (match) {
			this.count += 1
		} else {
			this.count = 0
		}
	}

	listen = callback => {
		this.callback = callback
		window.addEventListener('keydown', this.log)
	}

	remove = () => {
		this.callback = false
		window.removeEventListener('keydown', this.log)
	}
}
