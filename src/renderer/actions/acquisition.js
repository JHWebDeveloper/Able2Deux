import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from 'status'
import { updateMediaState } from '.'
import { createMediaData, replaceTokens, toastrOpts } from 'utilities'

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
	type: ACTION.ADD_MEDIA,
	payload: { newMedia }
})

export const removeMedia = ({ status, id, refId, references = 0 }) => async dispatch => {
	if (status === STATUS.DOWNLOAD_PENDING || status === STATUS.DOWNLOADING) {
		interop.cancelDownload(id)
	} else if (references < 2) {
		await interop.removeMediaFile(refId)
	}

	dispatch({
		type: ACTION.REMOVE_MEDIA,
		payload: { id }
	})
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

	const mediaData = createMediaData({
		url,
		title: url,
		status: STATUS.DOWNLOAD_PENDING,
		filename: 'download',
		acquisitionType: 'download'
	})

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

		return toastr.error(`Error finding video at ${url}. The url may not be a supported service.`, false, toastrOpts)
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

		toastr.error(`Error downloading from ${url}`, false, toastrOpts)
	}
}

// ---- UPLOAD ------------

export const upload = ({ name, path }) => async dispatch => {
	let mediaType = ''

	try {
		mediaType = await interop.checkFileType(path)
	} catch (err) {
		return toastr.error(`${name} is not a supported file type`, false, toastrOpts)
	}

	const mediaData = createMediaData({
		title: name,
		filename: interop.getFileName(name),
		sourceFilePath: path,
		mediaType,
		acquisitionType: 'upload'
	})

	dispatch(addMedia(mediaData))

	const { id } = mediaData

	dispatch(updateMediaStatus(id, STATUS.LOADING))

	try {
		const fileData = await interop.requestUpload(mediaData)

		dispatch(updateMediaStatus(id, STATUS.READY, fileData))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		return toastr.error(`Error loading ${name}`, false, toastrOpts)
	}
}

// ---- SCREEN RECORD ------------

export const loadRecording = (id, screenshot) => async dispatch => {
	const title = replaceTokens(`Able2 Screen${screenshot ? 'shot' : ' Record'} $t $d`)

	const mediaData = createMediaData({
		id,
		title,
		filename: title,
		acquisitionType: screenshot ? 'screenshot' : 'screen_record',
		status: STATUS.LOADING
	})

	dispatch(addMedia(mediaData))
}
