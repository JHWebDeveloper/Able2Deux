export const initTabbedBrowsing = () => {
	document.body.onkeydown = function (e) {
		if (e.keyCode !== 9) return
		
		this.className = 'accessible'
		this.onkeydown = false
	}
}
