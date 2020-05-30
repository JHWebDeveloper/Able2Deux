import React, { useCallback, useContext, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import { arrayOf, bool, func, object } from 'prop-types'

import { removeAllMedia, prepareMediaForFormat } from '../../actions/acquisition'
import { warn, arrayCount } from '../../utilities'
import * as STATUS from '../../status/types'

import MediaElement from './MediaElement'

// ---- store warning strings
const message = 'Remove all Entries?'
const detail = 'Any current downloads will be canceled. This cannot be undone. Proceed?'

const checkMediaReady = ({ status }) => (
	status === STATUS.READY || status === STATUS.FAILED
)

const checkMediaFailed = ({ status }) => (
	status === STATUS.FAILED
)

const ReadyQueue = withRouter(({ media, recording, warnings, dispatch, history }) => {
	const backgroundColor = !media.length ?  '#e0e0e0' : '#bbb'

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

	return (
		<div id="ready-queue">
			<div style={{ backgroundColor }}>
				{media.map(info => (
					<MediaElement
						key={info.id}
						dispatch={dispatch}
						warnRemove={warnings.remove}
						references={arrayCount(media, item => item.refId === info.refId)}
						{...info} />
					)
				)}
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
