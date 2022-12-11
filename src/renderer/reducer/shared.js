export const updateState = (state, payload) => ({
	...state,
	...payload
})

export const toggleCheckbox = (state, payload) => ({
	...state,
	[payload.property]: !state[payload.property]
})

export const updateNestedState = (state, payload) => ({
	...state,
	[payload.nest]: {
		...state[payload.nest],
		...payload.properties
	}
})

export const toggleNestedCheckbox = (state, payload) => {
	const { nest, property } = payload

	return {
		...state,
		[nest]: {
			...state[nest],
			[property]: !state[nest][property]
		}
	}
}

export const toggleSaveLocation = (state, payload) => ({
	...state,
	saveLocations: state.saveLocations.map(location => location.id === payload.id ? {
		...location,
		checked: !location.checked
	} : location)
})

export const removeSortableElement = (state, payload) => ({
	...state,
	[payload.nest]: state[payload.nest].filter(({ id }) => id !== payload.id)
})

const savePrefs = async (prefs, callback) => {
	try {
		await interop.savePrefs(prefs)
		callback?.()
	} catch (err) {
		toastr.error(errorToString(err), false, toastrOpts)
	}
}

export const moveSortableElement = (state, payload) => {
	let { oldPos, newPos } = payload
	const elements = [...state[payload.nest]]
	const targetElement = elements.splice(oldPos, 1)[0]

	if (oldPos < newPos) newPos--

	elements.splice(newPos, 0, targetElement)

	return {
		...state,
		[payload.nest]: elements
	}
}
