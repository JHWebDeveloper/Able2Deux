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
		detail: 'This cannot be undone. Proceed?'
	}, [])

	const warnRemoveReferencedMedia = useWarning({
		name: 'removeReferenced',
		detail: 'This media file has duplicates referencing it. Deleting this file will also delete these references. This cannot be undone. Proceed?'
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
		message: 'Remove all media items?',
		detail: 'Any current downloads will be canceled. This cannot be undone. Proceed?',
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
