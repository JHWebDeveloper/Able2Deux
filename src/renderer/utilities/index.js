export const initTabbedBrowsing = () => {
	document.body.onkeydown = function (e) {
		if (e.keyCode !== 9) return
		
		this.className = 'accessible'
		this.onkeydown = false
	}
}

export const toastrOpts = {
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
}

export * from './buildSource'
export * from './componentHelpers'
export * from './drawAble2Logo'
export * from './valueModifiers'
