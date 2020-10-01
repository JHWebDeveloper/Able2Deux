export const createScrollbarPadder = () => {
	let _el = false
	let _pad = 0

	const _addPad = () => {
		_el.style.paddingRight = _el.scrollHeight > _el.clientHeight ? `${_pad}px` : 0
	}

	let _observer = new MutationObserver(_addPad)

	return {
		observe(el, pad) {
			_el = el
			_pad = pad
	
			_addPad()
	
			_observer.observe(_el, {
				attributes: true,
				childList: true,
				subtree: true
			})
		},
		disconnect() {
			_observer.disconnect()
		}
	}
}
