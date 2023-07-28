import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, bool, func, object, shape } from 'prop-types'

import {
	removeFailedAcquisitions,
	removeAllMedia,
	removeMedia,
	removeReferencedMedia
} from 'actions'

import { useWarning } from 'hooks'
import { group } from 'utilities'
import * as STATUS from 'status'

import MediaElement from './MediaElement'

// ---- store warning strings
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

const ReadyQueue = ({ media, recording, warnings, dispatch }) => {
	const navigate = useNavigate()

	const uniqueMedia = useMemo(() => getUniqueFileRefs(media), [media])

	// eslint-disable-next-line no-extra-parens
	const notReady = useMemo(() => (
		recording || !uniqueMedia.length || !uniqueMedia.every(checkMediaReady) || uniqueMedia.every(checkMediaFailed)
	), [recording, uniqueMedia])

	const warnRemoveMedia = useWarning({
		name: 'remove',
		detail: removeMediaDetail,
	}, [media])

	const warnRemoveReferencedMedia = useWarning({
		name: 'removeReferenced',
		detail: removeReferencedMediaDetail,
	}, [media])

	const removeMediaWarning = useCallback(({ title, id, refId, status, references }) => {
		const hasRefs = references > 1

		const args = {
			message: `Remove ${title}?`,
			callback: hasRefs ? () => {
				dispatch(removeReferencedMedia(refId))
			} : () => {
				dispatch(removeMedia({
					id,
					refId,
					status,
					references
				}))
			}
		}

		if (hasRefs && warnings.removeReferenced) {
			return warnRemoveReferencedMedia(args)
		} else {
			return warnRemoveMedia(args)
		}
	}, [media, warnings.removeReferenced, removeReferencedMedia, warnRemoveMedia])

	const removeAllMediaWarning = useWarning({
		name: 'removeAll',
		message: 'Remove all entries?',
		detail: removeAllMediaDetail,
		callback() {
			dispatch(removeAllMedia())
		}
	}, [media])

	const removeFailedAcquisitionsAndRedirect = useCallback(() => {
		dispatch(removeFailedAcquisitions())
		navigate('/formatting')
	}, [])

	return (
		<div id="ready-queue">
			<div className={uniqueMedia.length ? 'populated' : ''}>
				{uniqueMedia.map(mediaElement => (
					<MediaElement
						key={mediaElement.id}
						removeMediaWarning={removeMediaWarning}
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
					onClick={removeFailedAcquisitionsAndRedirect}>Format</button>
				<button
					type="button"
					className="app-button"
					title="Remove All Media"
					aria-label="Remove All Media"
					onClick={() => removeAllMediaWarning()}
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
	dispatch: func.isRequired
}

export default ReadyQueue
