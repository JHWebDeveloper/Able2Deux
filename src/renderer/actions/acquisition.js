import toastr from 'toastr'

import * as ACTION from './types'
import * as STATUS from '../status/types'
import { updateMediaState } from '.'
import { createMediaData, replaceTokens, toastrOpts } from '../utilities'

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
	dispatch(updateMediaStatus(id, STATUS.CANCELLING))

	if (status === STATUS.DOWNLOADING) {
		await interop.cancelDownload(id)
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

	const mediaElement = createMediaData({
		url,
		title: url,
		filename: 'download',
		acquisitionType: 'download'
	})

	dispatch(addMedia(mediaElement))

	const { id } = mediaElement

	try {
		const urlInfo = await interop.getURLInfo({ id, url, disableRateLimit })

		dispatch(updateMediaState(id, {
			filename: urlInfo.title,
			...urlInfo
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
		const mediaData = await interop.requestDownloadChannel(downloadParams)

		mediaData.isLive = false

		dispatch(updateMediaStatus(id, STATUS.READY, mediaData))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		toastr.error(`Error downloading from ${url}`, false, toastrOpts)
	}
}

// ---- UPLOAD ------------

export const upload = ({ name, path }) => async dispatch => {
	let mediaType = false

	try {
		mediaType = await interop.checkFileType(path)
	} catch (err) {
		return toastr.error(`${name} is not a supported file type`, false, toastrOpts)
	}

	const mediaElement = createMediaData({
		title: name,
		filename: interop.getFileName(name),
		sourceFilePath: path,
		mediaType,
		acquisitionType: 'upload'
	})

	dispatch(addMedia(mediaElement))

	const { id } = mediaElement

	dispatch(updateMediaStatus(id, STATUS.LOADING))

	try {
		const mediaData = await interop.requestUpload(mediaElement)

		dispatch(updateMediaStatus(id, STATUS.READY, mediaData))
	} catch (err) {
		dispatch(updateMediaStatus(id, STATUS.FAILED))

		return toastr.error(`Error loading ${name}`, false, toastrOpts)
	}
}

// ---- SCREEN RECORD ------------

export const setRecording = recording => ({
	type: ACTION.UPDATE_STATE,
	payload: { recording }
})

export const loadRecording = (id, screenshot) => async dispatch => {
	const title = replaceTokens(`Able2 Screen${screenshot ? 'shot' : ' Record'} $t $d`)

	const mediaElement = createMediaData({
		id,
		title,
		filename: title,
		acquisitionType: screenshot ? 'screenshot' : 'screen_record',
		status: STATUS.LOADING
	})

	dispatch(addMedia(mediaElement))
}
