import toastr from 'toastr'

import { ACTION, STATUS } from 'constants'
import { updateMediaStateById } from 'actions'

import { TOASTR_OPTIONS } from 'constants'

import { createMediaData, errorToString } from 'utilities'

const { interop } = window.ABLE2

export const updateMediaStatus = (id, status, mediaData) => ({
	type: ACTION.UPDATE_MEDIA_STATE_BY_ID,
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

export const removeMedia = ({
	status,
	id,
	index,
	updateSelection = true
}) => async dispatch => {
	if (status === STATUS.DOWNLOAD_PENDING || status === STATUS.DOWNLOADING) {
		interop.cancelDownload(id)
	}

	dispatch({
		type: ACTION.REMOVE_MEDIA,
		payload: { index, id, updateSelection }
	})
}

export const removeReferencedMedia = refId => ({
	type: ACTION.REMOVE_REFERENCED_MEDIA,
	payload: { refId }
})

export const removeAllMediaAndStopDownloads = media => dispatch => {
	for (const item of media) {
		removeMedia(item)(dispatch)
	}
}

export const removeAllMedia = () => ({
	type: ACTION.REMOVE_ALL_MEDIA
})

// ---- DOWNLOAD ------------

const updateDownloadProgress = ({ id, downloadETA, downloadPercent }) => ({
	type: ACTION.UPDATE_MEDIA_STATE_BY_ID,
	payload: {
		id,
		properties: {
			downloadETA,
			downloadPercent
		}
	}
})

export const download = ({ url, optimize, output, disableRateLimit }) => async dispatch => {
	let mediaData = {}

	try {
		mediaData = await createMediaData({
			url,
			title: url,
			status: STATUS.DOWNLOAD_PENDING,
			filename: 'download',
			acquisitionType: 'download',
			importStarted: new Date(),
		})
	} catch (err) {
		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}

	dispatch(addMedia(mediaData))

	const { id } = mediaData

	try {
		const urlData = await interop.getURLInfo({ id, url, disableRateLimit })

		dispatch(updateMediaStateById(id, {
			filename: urlData.title,
			...urlData
		}))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
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

		toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}
}

// ---- UPLOAD ------------

export const upload = ({ name, path }) => async dispatch => {
	let streamData = {}
	let mediaData = {}

	try {
		streamData = await interop.checkFileType(path)
	} catch (err) {
		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}

	try {
		mediaData = await createMediaData({
			title: name,
			filename: interop.getFileName(name),
			sourceFilePath: path,
			acquisitionType: 'upload',
			importStarted: new Date(),
			...streamData
		})
	} catch (err) {
		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}
	
	dispatch(addMedia(mediaData))

	const { id } = mediaData

	dispatch(updateMediaStatus(id, STATUS.LOADING))

	try {
		const fileData = await interop.requestUpload(mediaData)

		dispatch(updateMediaStatus(id, STATUS.READY, fileData))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}
}

// ---- SCREEN RECORD ------------

export const loadRecording = (id, screenshot) => async dispatch => {
	const title = `Able2 Screen${screenshot ? 'shot' : ' Record'} $d $t`
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
		return toastr.error(errorToString(err), false, TOASTR_OPTIONS)
	}

	dispatch(addMedia(mediaData))
}
