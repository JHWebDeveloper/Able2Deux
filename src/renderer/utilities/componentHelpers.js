import * as STATUS from '../status/types'

export const closeOnBlur = callback => e => {
	if (!e.currentTarget.contains(e.relatedTarget)) callback(false)
}

export const compareProps = (prev, next) => {
	for (const key in prev) {
		if (typeof prev[key] === 'function' && typeof next[key] === 'function') continue

		if (prev[key] instanceof Object) {
			if (next[key] instanceof Object) {
				if (!compareProps(prev[key], next[key])) return false
			} else {
				return false
			}
		} else {
			if (prev[key] !== next[key]) return false
		}
	}

	return true
}

export const createSettingsMenu = actions => [
	{
		label: 'Copy Setting',
		action() { actions[0]() }
	},
	{
		label: 'Apply to All',
		action() { actions[1]() }
	}
]

export const extractSettings = settings => {
	const { arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return { arc, background, overlay, source, centering, position, scale, crop, rotation }
}

export const extractSettingsToArray = settings => {
	const { start, audio, arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return [ start, audio, arc, background, overlay, source, centering, position, scale, crop, rotation ]
}

export const getStatusColor = status => {
	switch (status) {
		case STATUS.DOWNLOADING:
		case STATUS.LOADING:
		case STATUS.RENDERING:
			return '#fcdb03'
		case STATUS.READY:
		case STATUS.COMPLETE:
			return '#0cf700'
		case STATUS.CANCELLING:
			return '#ff8000'
		case STATUS.FAILED:
		case STATUS.CANCELLED:
			return '#ff4800'
		default:
			return '#bbb'
	}
}

const { interop } = window.ABLE2

export const warn = async ({ enabled, message, detail, callback }) => {
	let proceed = true

	if (enabled) {
		proceed = await interop.warning({ message, detail }) === 0
	}

	if (proceed) callback()
}

