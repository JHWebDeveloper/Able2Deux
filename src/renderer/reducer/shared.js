import { clamp } from 'utilities'

export const updateState = (state, payload) => ({
	...state,
	...payload
})

export const toggleCheckbox = (state, payload) => ({
	...state,
	[payload.property]: !state[payload.property]
})

export const toggleSortableElementCheckbox = (state, payload) => {
	const { property = 'checked' } = payload

	return {
		...state,
		[payload.nest]: state[payload.nest].map(obj => obj.id === payload.id ? {
			...obj,
			[property]: !obj[property]
		} : obj)
	}
}

export const addSortableElement = (state, payload) => ({
	...state,
	[payload.nest]: state[payload.nest].toSpliced(payload.pos, 0, payload.element)
})

export const removeSortableElement = (state, payload) => ({
	...state,
	[payload.nest]: state[payload.nest].filter(({ id }) => id !== payload.id)
})

export const moveSortableElement = (state, payload) => {
	let { nest, oldPos, newPos } = payload
	const elements = [...state[nest]]
	const targetElement = elements.splice(oldPos, 1)[0]

	if (oldPos < newPos) newPos--

	elements.splice(clamp(newPos, 0, elements.length), 0, targetElement)

	return {
		...state,
		[nest]: elements
	}
}
