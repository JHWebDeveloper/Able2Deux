import { v1 as uuid } from 'uuid'
import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from '../status/types'
import { PromiseQueue } from './constructors'
import { updateMediaNestedState } from '.'
import buildSource from './buildSource'
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

export const moveMedia = (pos, dir = 1) => ({
	type: ACTION.MOVE_MEDIA,
	payload: {
		oldPos: pos,
		newPos: pos + dir
	}
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

const fillMissingFilenames = media => media.map(item => {
	if (!item.filename) item.filename = 'Able2 Export $t $d.$n'

	return item
})

const applyBatchName = (media, batch) => media.map(item => {
	if (!batch.name) return item

	if (batch.position === 'replace') {
		item.filename = batch.name.includes('$n') ? batch.name : `${batch.name}.$n`
	} else {
		const newName = [batch.name.trim(), item.filename]

		if (batch.position === 'append') newName.reverse()

		item.filename = newName.join(' ')
	}

	return item
})

const preventDuplicateFilenames = media => {
	const duplicates = {}
	const { length } = media
	let i = 0

	// count duplicate filenames
	while (i < length) {
		const key = media[i].filename
		i++

		if (key.includes('$n')) continue

		const count = media.filter(item => item.filename === key).length

		// store tally and length
		if (count > 1) duplicates[key] = [count, count]
	}

	// match duplicates to tally list and add instance number to filename
	while (i--) {
		const key = media[i].filename

		if (!duplicates[key]) continue

		media[i].filename += `.${zeroize(duplicates[key][0], duplicates[key][1])}`

		duplicates[key][0] -= 1
	}

	return media
}

const sanitizeFileNames = media => media.map((item, i) => ({
	...item,
	filename: replaceTokens(cleanFileName(item.filename), i, media.length)
}))

export const render = params => async dispatch => {
	let { media, saveLocations, batch, goBack } = params

	// Uncheck non existent directories and prompt to abort render if found

	for await (const location of saveLocations) {
		if (!location.checked) continue

		const exists = await interop.checkIfDirectoryExists(location.directory)

		if (exists) continue

		dispatch(toggleSaveLocation(location.id))

		if (await interop.directoryNotFoundAlert(location.directory)) {
			return !goBack()
		} else {
			location.checked = false
		}
	}

	// Prompt to choose a directory if no directories are selected or available

	let tempDir = false

	if (saveLocations.every(({ checked }) => !checked)) {
		const { filePaths, canceled } = await interop.chooseDirectory()

		if (canceled) return !goBack()
		
		tempDir = {
			checked: true,
			label: 'Temporary',
			directory: filePaths[0]
		}

		saveLocations.push(tempDir)
	}

	// Pipe filename modifiers

	media = sanitizeFileNames(preventDuplicateFilenames(applyBatchName(fillMissingFilenames(media), batch)))

	// Create promise queue and begin rendering

	renderQueue = new PromiseQueue(params.concurrent)

	media.forEach(item => {
		renderQueue.add(item.id, async () => {
			if (item.source.sourceName && !(item.arc === 'none' && item.aspectRatio !== '16:9')) {
				item.sourceData = buildSource(item.source, params.renderOutput)
			}

			try {
				await interop.requestRenderChannel({
					data: {
						...item,
						renderOutput: params.renderOutput,
						renderFrameRate: params.renderFrameRate,
						autoPNG: params.autoPNG,
						saveLocations: saveLocations.filter(({ checked }) => checked)
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
				const errStr = err.toString()

				if (errStr === 'Error: ffmpeg was killed with signal SIGKILL') {
					dispatch(updateRenderStatus(item.id, STATUS.CANCELLED))
				} else {
					dispatch(updateRenderStatus(item.id, STATUS.FAILED))

					let errMsg = `Failed to render ${item.filename}`

					if (/^Error: Start timecode/.test(err)) errMsg += '. Start timecode exceeds duration.'
					if (/^Error: End timecode/.test(err)) errMsg += '. End timecode preceeds start timecode.'

					toastr.error(errMsg, false, toastrOpts)
				}
			}
		})
	})

	renderQueue.start()

	// Delete temp directory if used

	if (tempDir) saveLocations.pop()
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
