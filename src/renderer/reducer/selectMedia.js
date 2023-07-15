import { findNearestIndex } from 'utilities'

const onShiftClick = (media, { clickedIndex }) => {
	const focusedIndex = media.findIndex(({ focused }) => focused)
	const anchoredIndex = media.findIndex(({ anchored }) => anchored)

	let start = Math.min(focusedIndex, anchoredIndex)
	let end = Math.max(focusedIndex, anchoredIndex)

	media = media.map((item, i) => i >= start && i <= end ? {
		...item,
		focused: false,
		selected: false
	} : item)

	start = Math.min(clickedIndex, anchoredIndex)
	end = Math.max(clickedIndex, anchoredIndex)

	return media.map((item, i) => i === clickedIndex ? {
		...item,
		focused: true,
		selected: true
	} : i >= start && i <= end ? {
		...item,
		focused: false,
		selected: true
	} : item)
}

const onCtrlClick = (media, { clickedIndex, clickedInFocus, clickedIsAnchored, clickedInSelection }) => {
	let nearestSelectedIndex = 0

	if (clickedInFocus || clickedIsAnchored) {
		nearestSelectedIndex = findNearestIndex(media, clickedIndex, ({ selected }) => selected)
	}

	if (clickedInFocus) {
		return media.map((item, i) => i === nearestSelectedIndex ? {
			...item,
			focused: true
		} : i === clickedIndex ? {
			...item,
			focused: false,
			selected: false
		} : item)
	} else if (clickedIsAnchored) {
		return media.map((item, i) => i === nearestSelectedIndex ? {
			...item,
			anchored: true
		} : i === clickedIndex ? {
			...item,
			anchored: false,
			selected: false
		} : item)
	} else if (clickedInSelection) {
		return media.map((item, i) => i === clickedIndex ? {
			...item,
			selected: false
		} : item)
	} else {
		return media.map((item, i) => {
			const focused = i === clickedIndex

			return {
				...item,
				focused,
				selected: focused || item.selected
			}
		})
	}
}

const onClick = (media, { clickedIndex, clickedInFocus, clickedInSelection }) => {
	if (clickedInFocus) {
		return [...media]
	} else if (clickedInSelection) {
		return media.map((item, i) => {
			const focused = i === clickedIndex

			return {
				...item,
				focused,
				anchored: focused
			}
		})
	} else {
		return media.map((item, i) => {
			const focused = i === clickedIndex

			return {
				...item,
				focused,
				anchored: focused,
				selected: focused
			}
		})
	}
}

export const selectMedia = (state, payload) => {
	const { ctrlOrCmd, shift } = payload
	let media = []

	if (ctrlOrCmd) {
		media = onCtrlClick(state.media, payload)
	} else if (shift) {
		media = onShiftClick(state.media, payload)
	} else {
		media = onClick(state.media, payload)
	}
	
	return { ...state, media }
}

export const selectAllMedia = (state, { focusIndex }) => {
	const updateFocus = !!focusIndex || focusIndex === 0

	return {
		...state,
		media: state.media.map((item, i) => item.focused ? {
			...item,
			focused: updateFocus ? focusIndex === i : true,
			anchored: true
		} : {
			...item,
			focused: updateFocus && focusIndex === i,
			anchored: false,
			selected: true
		})
	}
}

export const deselectAllMedia = state => ({
	...state,
	media: state.media.map(item => item.focused ? {
		...item,
		anchored: true
	} : {
		...item,
		anchored: false,
		selected: false
	})
})

export const removeMedia = (state, payload) => {
	const len = state.media.length

	if (len < 2) return { ...state, media: [] }

	const media = [...state.media]
	const index = payload?.index ?? media.findIndex(item => item.id === payload.id)
	const { focused, anchored } = media[index]

	if (payload.updateSelection && (focused || anchored)) {
		const fallbackIndex = index + (index < len - 1 ? 1 : -1)
		const nearestSelectedIndex = findNearestIndex(media, index, ({ selected }) => selected, fallbackIndex)
	
		if (focused) media[nearestSelectedIndex].focused = true
		if (anchored) media[nearestSelectedIndex].anchored = true
	
		media[nearestSelectedIndex].selected = true
	}

	media.splice(index, 1)

	return { ...state, media }
}
