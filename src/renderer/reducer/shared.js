import { clamp } from 'utilities'

export const updateState = (state, payload) => ({
	...state,
	...payload
})

export const updateMediaStateById = (state, { id, properties }) => ({
	...state,
	media: state.media.map(item => item.id === id ? {
		...item,
		...properties
	} : item)
})

export const toggleCheckbox = (state, { property }) => ({
	...state,
	[property]: !state[property]
})

export const toggleSortableElementCheckbox = (state, { nest = 'media', property = 'checked', id }) => ({
	...state,
	[nest]: state[nest].map(item => item.id === id ? {
		...item,
		[property]: !item[property]
	} : item)
})

export const addSortableElement = (state, { nest = 'media', pos, element }) => ({
	...state,
	[nest]: state[nest].toSpliced(pos, 0, element)
})

export const removeSortableElement = (state, { nest = 'media' , id }) => ({
	...state,
	[nest]: state[nest].filter(item => item.id !== id)
})

export const removeAllElements = (state, { nest = 'media' } = {}) => ({
	...state,
	[nest]: []
})

export const moveSortableElement = (state, { nest = 'media', oldPos, newPos }) => {
	const elements = [...state[nest]]
	const targetElement = elements.splice(oldPos, 1)[0]

	if (oldPos < newPos) newPos--

	elements.splice(clamp(newPos, 0, elements.length), 0, targetElement)

	return {
		...state,
		[nest]: elements
	}
}
