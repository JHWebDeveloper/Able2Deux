import { v1 as uuid } from 'uuid'

import * as STATUS from 'status'
import { createAnimator } from 'utilities'

export const detectTabExit = callback => e => {
	if (!e.currentTarget.contains(e.relatedTarget)) callback(false)
}

export const createSettingsMenu = ({
	multipleItems,
	multipleItemsSelected
}, actions, additionalOptions = []) => [
	{
		label: 'Copy Attributes',
		hide: !multipleItems,
		action() { actions[0]() }
	},
	{
		label: 'Apply to Selected',
		hide: !multipleItems || !multipleItemsSelected,
		action() { actions[1]() }
	},
	{
		label: 'Apply to All',
		hide: !multipleItems || multipleItemsSelected,
		action() { actions[2]() }
	},
	{
		type: 'spacer',
		hide: !multipleItems
	},
	{
		label: 'Save as Preset',
		action() { actions[3]() }
	},
	...additionalOptions
]

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

export const isArrowNext = ({ key }) => key === 'ArrowDown' || key === 'ArrowRight'
export const isArrowPrev = ({ key }) => key === 'ArrowUp' || key === 'ArrowLeft'

export const limitTCChars = colonMax => e => {
	if (/^[A-Za-z0-9~`!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]$/.test(e.key)) {
		const colons = e.target.value.match(/:|;/g) || []
		const regex = colons.length === colonMax ? /[.0-9]/ : /[:;.0-9]/
	
		if (!regex.test(e.key)) e.preventDefault()
	}
}

export const refocusBatchItem = () => {
	document.querySelector('.focused > button[name="select-media"]')?.focus()
}

export const replaceIds = (() => {
	const _replaceIds = (obj, replaceWith) => {
		obj = structuredClone(obj)

		if ('id' in obj) obj.id = replaceWith ?? uuid()
	
		const entries = Object.entries(obj)
	
		for (const [ key, val ] of entries) {
			if (Array.isArray(val)) obj[key] = val.map(_replaceIds)
		}
	
		return obj
	}

	return (obj, replaceWith) => Array.isArray(obj)
		? obj.map(item => _replaceIds(item, replaceWith))
		: _replaceIds(obj, replaceWith)
})()

export const eraseIds = obj => replaceIds(obj, '')

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
