import React, { useCallback, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import { arrayOf, bool, func, object } from 'prop-types'

import { moveMedia, removeAllMedia, prepareMediaForFormat } from 'actions'
import { warn, arrayCount } from 'utilities'
import * as STATUS from 'status'

import DraggableList from '../form_elements/DraggableList'
import MediaElement from './MediaElement'

// ---- store warning strings
const message = 'Remove all Entries?'
const detail = 'Any current downloads will be canceled. This cannot be undone. Proceed?'

const checkMediaReady = ({ status }) => status === STATUS.READY || status === STATUS.FAILED
const checkMediaFailed = ({ status }) => status === STATUS.FAILED

const ReadyQueue = withRouter(({ media, recording, warnings, dispatch, history }) => {
	const backgroundColor = !media.length ? '#e0e0e0' : '#bbb'

	// eslint-disable-next-line no-extra-parens
	const notReady = useMemo(() => (
		recording || !media.length || !media.every(checkMediaReady) || media.every(checkMediaFailed)
	), [recording, media])

	const removeAllMediaWithWarning = useCallback(() => {
		warn({
			message,
			detail,
			enabled: warnings.removeAll,
			callback() { dispatch(removeAllMedia(media)) }
		})
	}, [warnings.removeAll, media])

	const prepareMediaAndRedirect = useCallback(() => {
		dispatch(prepareMediaForFormat())

		history.push('/render')
	}, [])

	const sortingAction = useCallback((newPos, oldPos) => {
		dispatch(moveMedia(newPos, oldPos))
	}, [])

	return (
		<div id="ready-queue">
			<div style={{ backgroundColor }}>
				<DraggableList sortingAction={sortingAction}>
					{media.map(info => (
						<MediaElement
							key={info.id}
							dispatch={dispatch}
							warnRemove={warnings.remove}
							references={arrayCount(media, item => item.refId === info.refId)}
							{...info} />
					))}
				</DraggableList>
			</div>
			<div>
				<button
					type="button"
					title="Format Media"
					className="app-button"
					disabled={notReady}
					onClick={prepareMediaAndRedirect}>Format</button>
				<button
					type="button"
					className="app-button"
					title="Remove All Media"
					onClick={removeAllMediaWithWarning}
					disabled={!media.length}>Remove All</button>
			</div>
		</div>
	)
})

ReadyQueue.propTypes = {
	media: arrayOf(object),
	recording: bool.isRequired,
	warnRemoveAll: bool,
	warnRemove: bool,
	dispatch: func.isRequired
}

export default ReadyQueue
