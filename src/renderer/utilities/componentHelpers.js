import { v1 as uuid } from 'uuid'

import * as STATUS from 'status'
import { createAnimator } from 'utilities'

export const detectTabExit = callback => e => {
	if (!e.currentTarget.contains(e.relatedTarget)) callback(false)
}

export const createSettingsMenu = ({
	multipleItems,
	multipleItemsSelected,
	allItemsSelected
}, actions, additionalOptions = []) => multipleItems ? [
	{
		label: 'Copy Setting',
		action() { actions[0]() }
	},
	{
		label: 'Apply to Selected',
		hide: !multipleItemsSelected || allItemsSelected || actions.length < 3,
		action() { actions[1]() }
	},
	{
		label: 'Apply to All',
		action() { actions.at(-1)() }
	},
	...additionalOptions
] : []

export const getStatusColor = status => {
	switch (status) {
		case STATUS.DOWNLOADING:
		case STATUS.LOADING:
		case STATUS.RENDERING:
			return '#fcdb03'
		case STATUS.READY:
		case STATUS.COMPLETE:
			return '#0cf700'
		case STATUS.FAILED:
		case STATUS.CANCELLED:
			return '#ff4800'
		default:
			return '#bbb'
	}
}

export const has11pmBackground = background => background === 'light_blue' || background === 'dark_blue' || background === 'teal' || background === 'tan'

export const limitTCChars = colonMax => e => {
	if (/^[A-Za-z0-9~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]$/.test(e.key)) {
		const colons = e.target.value.match(/:|;/g) || []
		const regex = colons.length === colonMax ? /[.0-9]/ : /[:;.0-9]/
	
		if (!regex.test(e.key)) e.preventDefault()
	}
}

export const replaceIds = (() => {
	const _replaceIds = obj => {
		obj = { ...obj }

		if ('id' in obj) obj.id = uuid()
	
		const entries = Object.entries(obj)
	
		for (const [ key, val ] of entries) {
			if (Array.isArray(val)) obj[key] = val.map(_replaceIds)
		}
	
		return obj
	}

	return arr => Array.isArray(arr) ? arr.map(_replaceIds) : _replaceIds(arr)
})()

export const sortCurvePoints = (a, b) => a.x - b.x

export const scrollText = el => {
	const original = el.innerText
	const animator = createAnimator()

	const panText = pause => {
		if (el.scrollWidth === el.clientWidth) {
			el.style.textOverflow = 'clip'
			pause()
		} else {
			el.innerText = el.innerText.slice(1)
		}
	}

	const resetPanText = () => {
		el.innerText = original
		el.style.removeProperty('text-overflow')
	}

	animator
		.onFrame(panText, 10)
		.onStop(resetPanText)

	el.addEventListener('mouseenter', animator.start)
	el.addEventListener('mouseleave', animator.stop)

	return {
		disconnect() {
			el.removeEventListener('mouseenter', animator.start)
			el.removeEventListener('mouseleave', animator.stop)
		}
	}
}

export const warn = async ({ enabled, message, detail, callback, checkboxCallback }) => {
	if (enabled) {
		const { response, checkboxChecked } = await window.ABLE2.interop.warning({
			message,
			detail,
			hasCheckbox: !!checkboxCallback
		})

		if (response > 0) return false

		if (checkboxChecked) checkboxCallback()
	}

	callback()
}
