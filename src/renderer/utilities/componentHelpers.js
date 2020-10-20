import * as STATUS from 'status'

export const detectTabExit = callback => e => {
	if (!e.currentTarget.contains(e.relatedTarget)) callback(false)
}

export const compareProps = (prevProps, nextProps) => {
	const keys = Object.keys(prevProps)

	for (const key of keys) {
		const prev = prevProps[key]
		const next = nextProps[key]

		if (typeof prev === 'function' && typeof next === 'function') continue

		if (prev instanceof Object) {
			if (next instanceof Object) {
				if (!compareProps(prev, next)) return false
			} else {
				return false
			}
		} else {
			if (prev !== next) return false
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

const { interop } = window.ABLE2

export const warn = async ({ enabled, message, detail, callback }) => {
	let proceed = true

	if (enabled) {
		proceed = await interop.warning({ message, detail }) === 0
	}

	if (proceed) callback()
}

