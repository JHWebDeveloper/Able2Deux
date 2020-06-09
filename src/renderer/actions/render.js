import { v1 as uuid } from 'uuid'
import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from '../status/types'
import { PromiseQueue } from './constructors'
import { updateMediaNestedState } from '.'
import { zeroize, cleanFileName, replaceTokens, toastrOpts } from '../utilities'


const { interop } = window.ABLE2

// ---- MEDIA MANAGER --------

export const selectMedia = id => ({
	type: ACTION.UPDATE_STATE,
	payload: { selectedId: id }
})

export const mergeSettings = (id, properties) => ({
	type: ACTION.UPDATE_MEDIA_STATE,
	payload: { id, properties }
})

export const copySettings = settings => ({
	type: ACTION.UPDATE_STATE,
	payload: {
		copiedSettings: { ...settings }
	}
})

export const pasteSettings = id => ({
	type: ACTION.PASTE_SETTINGS,
	payload: { id }
})

export const duplicateMedia = id => ({
	type: ACTION.DUPLICATE_MEDIA,
	payload: { id, newId: uuid() }
})

export const applySettingsToAll = (id, properties) => ({
	type: ACTION.APPLY_TO_ALL,
	payload: { id, properties }
})

export const toggleSaveLocation = id => ({
	type: ACTION.TOGGLE_SAVE_LOCATION,
	payload: { id }
})


// ---- SCALE --------

export const updateScale = (id, editAll, scale, e) => dispatch => {
	const value = parseFloat(e.target.value)
	const isx = e.target.name === 'x'
	const offset = (isx ? scale.y / scale.x : scale.x / scale.y) || 1

	dispatch(updateMediaNestedState(id, 'scale', {
		x: isx ? value : value * offset,
		y: isx ? value * offset : value
	}, editAll))
}

export const fitToFrameWidth = (id, editAll, scale, frameWidthPrc) => dispatch => {
	dispatch(updateMediaNestedState(id, 'scale', {
		x: frameWidthPrc,
		y: scale.link ? frameWidthPrc : scale.y
	}, editAll))
}

export const fitToFrameHeight = (id, editAll, scale, frameHeightPrc) => dispatch => {
	dispatch(updateMediaNestedState(id, 'scale', {
		x: scale.link ? frameHeightPrc : scale.x,
		y: frameHeightPrc
	}, editAll))
}


// ---- CROP --------

export const updateCropBiDirectional = (id, editAll, d1, d2, e) => dispatch => {
	const value = parseFloat(e.target.value)

	dispatch(updateMediaNestedState(id, 'crop', {
		[d1]: value,
		[d2]: value
	}, editAll))
}


// ---- RENDER --------

const updateRenderStatus = (id, status) => ({
	type: ACTION.UPDATE_MEDIA_NESTED_STATE,
	payload: {
		id: id,
		nest: 'render',
		properties: { status }
	}
})

const updateRenderProgress = ({ id, percent }) => ({
	type: ACTION.UPDATE_MEDIA_NESTED_STATE,
	payload: {
		id,
		nest: 'render',
		properties: { percent }
	}
})

let renderQueue = false

const preventDuplicateNames = (filename, media, index) => {
	const count = media.filter(item => item.filename === filename)

	if (count.length === 1) return media[index].filename

	const firstIndex = media.findIndex(item => item.filename === filename)

	return [
		media[index].filename,
		zeroize(firstIndex - index + 1, count)
	].join('.')
}

export const render = ({ media, batchName, saveLocations, renderOutput, concurrent }) => dispatch => {
	renderQueue = new PromiseQueue(concurrent)

	if (batchName) {
		if (!batchName.includes('$n')) batchName = `${batchName}.$n`

		media = media.map(item => ({
			...item,
			filename: batchName
		}))
	} else {
		media = media.map((item, i) => item.filename.includes('$n') ? item : {
			...item,
			filename: !!item.filename ? preventDuplicateNames(item.filename, media, i) : 'Able2 Export $t $d.$n'
		})
	}

	media = media.map((item, i) => ({
		...item,
		filename: replaceTokens(cleanFileName(item.filename), i, media.length)
	}))

	media.forEach(item => {
		if (item.render.status !== STATUS.PENDING) {
			dispatch(updateRenderStatus(item.id, STATUS.PENDING))
		}

		renderQueue.add(item.id, async () => {
			try {
				await interop.requestRenderChannel({
					data: {
						...item,
						renderOutput,
						saveLocations
					},
					startCallback() {
						dispatch(updateRenderStatus(item.id, STATUS.RENDERING))
					},
					progressCallback(data) {
						dispatch(updateRenderProgress(data))
					}
				})
		
				dispatch(updateRenderStatus(item.id, STATUS.COMPLETE))
			} catch (err) {
				if (err.toString() === 'Error: ffmpeg was killed with signal SIGKILL') {
					dispatch(updateRenderStatus(item.id, STATUS.CANCELLED))
				} else {
					dispatch(updateRenderStatus(item.id, STATUS.FAILED))
					toastr.error(`${item.filename} failed to render`, false, toastrOpts)
				}
			}
		})

		renderQueue.start()
	})
}

export const cancelRender = (id, status) => async dispatch => {
	dispatch(updateRenderStatus(id, STATUS.CANCELLING))

	if (status === STATUS.RENDERING) return interop.cancelRender(id)
	if (status === STATUS.PENDING) renderQueue.remove(id)

	dispatch(updateRenderStatus(id, STATUS.CANCELLED))
}

export const startOver = () => dispatch => {
	dispatch({ type: ACTION.START_OVER })
	interop.clearTempFiles()
}
