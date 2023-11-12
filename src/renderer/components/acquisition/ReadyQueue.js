import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, bool, func, object, shape } from 'prop-types'

import {
	removeAllMedia,
	removeAllMediaAndStopDownloads,
	removeMedia,
	removeReferencedMedia
} from 'actions'

import { STATUS } from 'constants'
import { useWarning } from 'hooks'
import { group } from 'utilities'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import ReadyQueueItem from './ReadyQueueItem'

const getUniqueFileRefs = media => group(media, 'refId').reduce((acc, arr) => {
	const obj = arr.find(({ refId, id }) => refId === id)?.[0] || arr.at(-1)

	if (obj) acc.push({
		...obj,
		references: arr.length
	})

	return acc
}, [])

const checkActiveImports = ({ status }) => status !== STATUS.FAILED

const ReadyQueue = ({ pendingMedia, media, recording,  warnings, dispatch, importQueueDispatch }) => {
	const navigate = useNavigate()
	const uniqueMedia = useMemo(() => getUniqueFileRefs(media), [media])
	const uniqueMediaLength = uniqueMedia.length
	const pendingMediaLength = pendingMedia.length
	const notReady = recording || !uniqueMediaLength || (!!pendingMediaLength && pendingMedia.some(checkActiveImports))

	const warnRemoveMedia = useWarning({
		name: 'remove',
		detail: 'This cannot be undone. Proceed?'
	}, [])

	const warnRemoveReferencedMedia = useWarning({
		name: 'removeReferenced',
		detail: 'This media file has duplicates referencing it. Deleting this file will also delete these references. This cannot be undone. Proceed?'
	}, [])

	const removeMediaWarning = useCallback(({ title, id, refId, status, references = 1 }, toDispatch) => {
		const hasRefs = references > 1

		const args = {
			message: `Remove ${title}?`,
			onConfirm: hasRefs ? () => {
				toDispatch(removeReferencedMedia(refId))
			} : () => {
				toDispatch(removeMedia({ id, status }))
			}
		}

		if (hasRefs && warnings.removeReferenced) {
			return warnRemoveReferencedMedia(args)
		} else {
			return warnRemoveMedia(args)
		}
	}, [warnings.removeReferenced, removeReferencedMedia, warnRemoveMedia])

	const removeAllPendingMedia = () => {
		importQueueDispatch(removeAllMediaAndStopDownloads(pendingMedia))
	}

	const removeAllMediaWarning = useWarning({
		name: 'removeAll',
		message: 'Remove all media items?',
		detail: 'Any current downloads will be canceled. This cannot be undone. Proceed?',
		onConfirm() {
			removeAllPendingMedia()
			dispatch(removeAllMedia())
		}
	})

	return (
		<div className="queue-list">
			<div className={uniqueMedia.length ? 'populated' : ''}>
				{[...pendingMedia, ...uniqueMedia].map((item, i) => (
					<ReadyQueueItem
						key={item.id}
						removeMediaWarning={removeMediaWarning}
						dispatch={i < pendingMediaLength ? importQueueDispatch : dispatch}
						{...item} />
				))}
			</div>
			<div>
				<ButtonWithIcon
					label="Format"
					icon="tune"
					title="Format Media"
					onClick={() => {
						removeAllPendingMedia()
						navigate('/formatting')
					}}
					disabled={notReady} />
				<ButtonWithIcon
					label="Remove All"
					icon="delete"
					title="Remove All Media"
					onClick={() => removeAllMediaWarning()}
					disabled={!pendingMediaLength && !uniqueMediaLength} />
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
