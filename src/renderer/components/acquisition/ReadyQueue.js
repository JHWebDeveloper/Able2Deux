import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, bool, func, object, shape } from 'prop-types'

import {
	removeFailedAcquisitions,
	removeAllMediaAndStopDownloads,
	removeMedia,
	removeReferencedMedia
} from 'actions'

import { STATUS } from 'constants'
import { useWarning } from 'hooks'
import { group } from 'utilities'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import MediaElement from './MediaElement'

// ---- store warning strings
const REMOVE_MEDIA_DETAIL = 'This cannot be undone. Proceed?'
const REMOVE_ALL_MEDIA_DETAIL = `Any current downloads will be canceled. ${REMOVE_MEDIA_DETAIL}`
const REMOVE_REFERENCED_MEDIA_DETAIL = `This media file has duplicates referencing it. Deleting this file will also delete these references. ${REMOVE_MEDIA_DETAIL}`

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
		detail: REMOVE_MEDIA_DETAIL
	}, [])

	const warnRemoveReferencedMedia = useWarning({
		name: 'removeReferenced',
		detail: REMOVE_REFERENCED_MEDIA_DETAIL
	}, [])

	const removeMediaWarning = useCallback(({ title, id, refId, status, references }) => {
		const hasRefs = references > 1

		const args = {
			message: `Remove ${title}?`,
			onConfirm: hasRefs ? () => {
				dispatch(removeReferencedMedia(refId))
			} : () => {
				dispatch(removeMedia({ id, status }))
			}
		}

		if (hasRefs && warnings.removeReferenced) {
			return warnRemoveReferencedMedia(args)
		} else {
			return warnRemoveMedia(args)
		}
	}, [warnings.removeReferenced, removeReferencedMedia, warnRemoveMedia])

	const removeAllMediaWarning = useWarning({
		name: 'removeAll',
		message: 'Remove all entries?',
		detail: REMOVE_ALL_MEDIA_DETAIL,
		onConfirm() {
			dispatch(removeAllMediaAndStopDownloads(media))
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
				<ButtonWithIcon
					label="Format"
					icon="tune"
					title="Format Media"
					onClick={removeFailedAcquisitionsAndRedirect}
					disabled={notReady} />
				<ButtonWithIcon
					label="Remove All"
					icon="delete"
					title="Remove All Media"
					onClick={() => removeAllMediaWarning()}
					disabled={!uniqueMedia.length} />
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
