import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, bool, func, object, shape } from 'prop-types'

import {
	disableWarningAndSave,
	prepareMediaForFormat,
	removeMedia,
	removeAllMedia
} from 'actions'

import { group, warn } from 'utilities'
import * as STATUS from 'status'

import MediaElement from './MediaElement'

// ---- store warning strings
const removeAllMediaMessage = 'Remove all Entries?'
const removeMediaDetail = 'This cannot be undone. Proceed?'
const removeAllMediaDetail = `Any current downloads will be canceled. ${removeMediaDetail}`
const removeReferencedMediaDetail = `This media file has duplicates referencing it. Deleting this file will also delete these references. ${removeMediaDetail}`

const getUniqueFileRefs = media => group(media, 'refId').reduce((acc, arr) => {
	const obj = arr.find(({ refId, id }) => refId === id)?.[0] || arr.at(-1)

	if (obj) acc.push({
		...obj,
		references: arr.length
	})

	return acc
}, [])

const checkMediaReady = ({ status }) => status === STATUS.READY || status === STATUS.FAILED
const checkMediaFailed = ({ status }) => status === STATUS.FAILED

const ReadyQueue = ({ media, recording, warnings, dispatch, dispatchPrefs }) => {
	const navigate = useNavigate()

	const uniqueMedia = useMemo(() => getUniqueFileRefs(media), [media])

	// eslint-disable-next-line no-extra-parens
	const notReady = useMemo(() => (
		recording || !uniqueMedia.length || !uniqueMedia.every(checkMediaReady) || uniqueMedia.every(checkMediaFailed)
	), [recording, uniqueMedia])

	const removeMediaWarning = useCallback(({ title, id, refId, status, references }) => warn({
		message: `Remove "${title}"?`,
		detail: removeMediaDetail,
		enabled: warnings.remove,
		callback() {
			dispatch(removeMedia({
				id,
				refId,
				status,
				references
			}))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('remove'))
		}
	}), [warnings.remove])

	const removeReferencedMediaWarning = useCallback(({ title, refId }) => warn({
		message: `Remove "${title}"?`,
		detail: removeReferencedMediaDetail,
		enabled: warnings.removeReferenced,
		callback() {
			dispatch(removeAllMedia(media.filter(mediaElement => mediaElement.refId === refId)))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('removeReferenced'))
		}
	}), [media, warnings.removeReferenced])

	const removeAllMediaWarning = useCallback(() => warn({
		message: removeAllMediaMessage,
		detail: removeAllMediaDetail,
		enabled: warnings.removeAll,
		callback() {
			dispatch(removeAllMedia(media))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('removeAll'))
		}
	}), [media, warnings.removeAll])

	const prepareMediaAndRedirect = useCallback(() => {
		dispatch(prepareMediaForFormat())
		navigate('/formatting')
	}, [])

	return (
		<div id="ready-queue">
			<div className={uniqueMedia.length ? 'populated' : ''}>
				{uniqueMedia.map(mediaElement => (
					<MediaElement
						key={mediaElement.id}
						removeMediaWarning={mediaElement.references < 2 ? removeMediaWarning : removeReferencedMediaWarning}
						{...mediaElement} />
				))}
			</div>
			<div>
				<button
					type="button"
					title="Format Media"
					aria-label="Format Media"
					className="app-button"
					disabled={notReady}
					onClick={prepareMediaAndRedirect}>Format</button>
				<button
					type="button"
					className="app-button"
					title="Remove All Media"
					aria-label="Remove All Media"
					onClick={removeAllMediaWarning}
					disabled={!uniqueMedia.length}>Remove All</button>
			</div>
		</div>
	)
}

ReadyQueue.propTypes = {
	media: arrayOf(object),
	recording: bool.isRequired,
	warnings: shape({
		remove: bool.isRequired,
		removeAll: bool.isRequired
	}).isRequired,
	dispatch: func.isRequired,
	dispatchPrefs: func.isRequired
}

export default ReadyQueue
