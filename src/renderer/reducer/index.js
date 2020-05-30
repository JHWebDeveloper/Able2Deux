import * as ACTION from '../actions/types'
import * as STATUS from '../status/types'

const matcher = media => (id, callback, editAll) => (
	media.map(item => editAll || item.id === id ? callback(item) : item)
)

export default (state, action) => {
	const { type, payload } = action

	const updateMedia = matcher(state.media)

	switch (type) {
		case ACTION.UPDATE_STATE:
			return {
				...state,
				...payload
			}
		case ACTION.TOGGLE_CHECKBOX:
			return {
				...state,
				[payload.property]: !state[payload.property]
			}
		case ACTION.UPDATE_NESTED_STATE:
			return {
				...state,
				[payload.nest]: {
					...state[payload.nest],
					...payload.properties
				}
			}
		case ACTION.TOGGLE_NESTED_CHECKBOX: {
			const { nest, property } = payload

			return {
				...state,
				[nest]: {
					...state[nest],
					[property]: !state[nest][property]
				}
			}
		}
		case ACTION.UPDATE_MEDIA_STATE: {
			const { id, properties, editAll } = payload

			return {
				...state,
				media: updateMedia(id, item => ({
					...item,
					...properties
				}), editAll)
			}
		}
		case ACTION.UPDATE_MEDIA_NESTED_STATE: {
			const { id, nest, properties, editAll } = payload

			return {
				...state,
				media: updateMedia(id, item => ({
					...item,
					[nest]: {
						...item[nest],
						...properties
					}
				}), editAll)
			}
		}
		case ACTION.TOGGLE_MEDIA_NESTED_CHECKBOX: {
			const { id, nest, property, editAll } = payload

			return {
				...state,
				media: updateMedia(id, item => ({
					...item,
					[nest]: {
						...item[nest],
						[property]: !item[nest][property]
					}
				}), editAll)
			}
		}
		case ACTION.ADD_MEDIA:
			return {
				...state,
				media: [payload.newMedia].concat(state.media)
			}
		case ACTION.DUPLICATE_MEDIA: {
			const index = state.media.findIndex(item => item.id === payload.id)
			const media = Array.from(state.media)

			media.splice(index, 0, {
				...media[index],
				id: payload.newId
			})

			return { ...state, media }
		}
		case ACTION.REMOVE_MEDIA:
			return {
				...state,
				media: state.media.filter(item => item.id !== payload.id)
			}
		case ACTION.PREPARE_MEDIA_FOR_FORMAT: {
			const media = state.media.filter(item => item.status !== STATUS.FAILED)

			return {
				...state,
				media,
				selectedId: media[0].id
			}
		}
		case ACTION.PASTE_SETTINGS:
			return {
				...state,
				media: updateMedia(payload.id, item => ({
					...item,
					...state.copiedSettings
				}))
			}
		case ACTION.APPLY_TO_ALL:
			return {
				...state,
				media: state.media.map(item => item.id !== payload.id ? {
					...item,
					...payload.properties
				} : item)
			}
		case ACTION.TOGGLE_SAVE_LOCATION:
			return {
				...state,
				saveLocations: state.saveLocations.map(location => location.id === payload.id ? {
					...location,
					checked: !location.checked
				} : location)
			}
		default:
			return state
	}
}
