import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from 'status'
import { updateMediaState, removeSortableElement } from '.'

import {
	createMediaData,
	errorToString,
	replaceTokens,
	toastrOpts
} from 'utilities'

const { interop } = window.ABLE2

const resetURL = () => ({
	type: ACTION.UPDATE_STATE,
	payload: { url: '' }
})

export const updateMediaStatus = (id, status, mediaData) => ({
	type: ACTION.UPDATE_MEDIA_STATE,
	payload: {
		id,
		properties: {
			status,
			...mediaData
		}
	}
})


// ---- ADD/REMOVE MEDIA ------------

export const addMedia = newMedia => ({
	type: ACTION.ADD_SORTABLE_ELEMENT,
	payload: {
		element: newMedia,
		nest: 'media',
		pos: 0
	}
})

export const removeMedia = ({ status, id, refId, references = 0 }) => async dispatch => {
	if (status === STATUS.DOWNLOAD_PENDING || status === STATUS.DOWNLOADING) {
		interop.cancelDownload(id)
	} else if (references < 2) {
		await interop.removeMediaFile(refId)
	}

	dispatch(removeSortableElement(id, 'media'))
}

// eslint-disable-next-line no-extra-parens
export const removeAllMedia = media => async dispatch => (
	Promise.all(media.map(item => removeMedia(item)(dispatch)))
)

export const prepareMediaForFormat = () => ({
	type: ACTION.PREPARE_MEDIA_FOR_FORMAT
})


// ---- DOWNLOAD ------------

const updateDownloadProgress = ({ id, eta, percent }) => ({
	type: ACTION.UPDATE_MEDIA_STATE,
	payload: {
		id,
		properties: {
			download: { eta, percent }
		}
	}
})

export const download = ({ url, optimize, output, disableRateLimit }) => async dispatch => {
	dispatch(resetURL())

	let mediaData = {}

	try {
		mediaData = await createMediaData({
			url,
			title: url,
			status: STATUS.DOWNLOAD_PENDING,
			filename: 'download',
			acquisitionType: 'download'
		})
	} catch (err) {
		return toastr.error(errorToString(err), false, toastrOpts)
	}

	dispatch(addMedia(mediaData))

	const { id } = mediaData

	try {
		const urlData = await interop.getURLInfo({ id, url, disableRateLimit })

		dispatch(updateMediaState(id, {
			filename: urlData.title,
			...urlData
		}))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		return toastr.error(errorToString(err), false, toastrOpts)
	}

	const downloadParams = {
		data: {
			id,
			url,
			optimize,
			output,
			disableRateLimit
		},
		startCallback() {
			dispatch(updateMediaStatus(id, STATUS.DOWNLOADING))
		},
		progressCallback(data) {
			dispatch(updateDownloadProgress(data))
		}
	}

	try {
		const downloadData = await interop.requestDownloadChannel(downloadParams)

		downloadData.isLive = false

		dispatch(updateMediaStatus(id, STATUS.READY, downloadData))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		toastr.error(errorToString(err), false, toastrOpts)
	}
}

// ---- UPLOAD ------------

export const upload = ({ name, path }) => async dispatch => {
	let streamData = {}
	let mediaData = {}

	try {
		streamData = await interop.checkFileType(path)
	} catch (err) {
		return toastr.error(errorToString(err), false, toastrOpts)
	}

	try {
		mediaData = await createMediaData({
			title: name,
			filename: interop.getFileName(name),
			sourceFilePath: path,
			acquisitionType: 'upload',
			...streamData
		})
	} catch (err) {
		return toastr.error(errorToString(err), false, toastrOpts)
	}

	dispatch(addMedia(mediaData))

	const { id } = mediaData

	dispatch(updateMediaStatus(id, STATUS.LOADING))

	try {
		const fileData = await interop.requestUpload(mediaData)

		dispatch(updateMediaStatus(id, STATUS.READY, fileData))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		return toastr.error(errorToString(err), false, toastrOpts)
	}
}

// ---- SCREEN RECORD ------------

export const loadRecording = (id, screenshot) => async dispatch => {
	const title = replaceTokens(`Able2 Screen${screenshot ? 'shot' : ' Record'} $t $d`)
	let mediaData = {}

	try {
		mediaData = await createMediaData({
			id,
			title,
			filename: title,
			acquisitionType: screenshot ? 'screenshot' : 'screen_record',
			status: STATUS.LOADING
		})
	} catch (err) {
		return toastr.error(errorToString(err), false, toastrOpts)
	}

	dispatch(addMedia(mediaData))
}
