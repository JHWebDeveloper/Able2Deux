export class ScrollbarPadder {
	constructor() {
		this.el = false
		this.pad = 0
		this.observer = new MutationObserver(this.addPad)
	}

	addPad = () => {
		this.el.style.paddingRight = this.el.scrollHeight > this.el.clientHeight
			? `${this.pad}px`
			: 0
	}

	observe = (el, pad) => {
		this.el = el
		this.pad = pad
		
		this.addPad()

		this.observer.observe(el, {
			attributes: true,
			childList: true,
			subtree: true
		})
	}

	disconnect = () => {
		this.observer.disconnect()
	}
}
