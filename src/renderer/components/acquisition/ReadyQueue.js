import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, bool, func, object, shape } from 'prop-types'

import {
	disableWarningAndSave,
	prepareMediaForFormat,
	moveSortableElement,
	removeMedia,
	removeAllMedia
} from 'actions'

import { warn, arrayCount } from 'utilities'
import * as STATUS from 'status'

import DraggableList from '../form_elements/DraggableList'
import MediaElement from './MediaElement'

// ---- store warning strings
const removeAllMediaMessage = 'Remove all Entries?'
const removeAllMediaDetail = 'Any current downloads will be canceled. This cannot be undone. Proceed?'
const removeMediaDetail = 'This cannot be undone. Proceed?'

const checkMediaReady = ({ status }) => status === STATUS.READY || status === STATUS.FAILED
const checkMediaFailed = ({ status }) => status === STATUS.FAILED

const ReadyQueue = ({ media, recording, warnings, dispatch, dispatchPrefs }) => {
	const navigate = useNavigate()

	// eslint-disable-next-line no-extra-parens
	const notReady = useMemo(() => (
		recording || !media.length || !media.every(checkMediaReady) || media.every(checkMediaFailed)
	), [recording, media])

	const removeMediaWarning = useCallback(({ id, refId, status, title }) => warn({
		message: `Remove "${title}"?`,
		detail: removeMediaDetail,
		enabled: warnings.remove,
		callback() {
			dispatch(removeMedia({
				id,
				refId,
				status,
				references: arrayCount(media, item => item.refId === refId)
			}))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('remove'))
		}
	}), [media, warnings.remove])

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

	const sortingAction = useCallback((newPos, oldPos) => {
		dispatch(moveSortableElement('media', newPos, oldPos))
	}, [])

	return (
		<div id="ready-queue">
			<div className={media.length ? 'populated' : ''}>
				<DraggableList sortingAction={sortingAction}>
					{media.map(info => (
						<MediaElement
							key={info.id}
							removeMediaWarning={removeMediaWarning}
							{...info} />
					))}
				</DraggableList>
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
					disabled={!media.length}>Remove All</button>
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
