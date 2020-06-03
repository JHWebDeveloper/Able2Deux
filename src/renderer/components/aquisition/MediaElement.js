import React, { useCallback, useMemo } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import * as STATUS from '../../status/types'
import { removeMedia } from '../../actions/acquisition'
import { warn, capitalize } from '../../utilities'

const getStatusColor = status => {
	switch (status) {
		case STATUS.DOWNLOADING:
		case STATUS.LOADING:
			return '#fcdb03'
		case STATUS.READY:
			return '#0cf700'
		case STATUS.FAILED:
		case STATUS.CANCELLING:
			return '#ff4800'
		default:
			return '#bbb'
	}
}

const MediaElement = ({ id, refId, status, references, title, download, warnRemove, dispatch }) => {
	const downloading = status === STATUS.DOWNLOADING
	const color = useMemo(() => getStatusColor(status), [status])

	const removeMediaWithWarning = useCallback(() => {
		warn({
			message: `Remove "${title}"?`,
			detail: `${downloading ? 'The current download will be canceled. ' : ''}This cannot be undone. Proceed?`,
			enabled: warnRemove,
			callback() { dispatch(removeMedia({ id, refId, status, references })) }
		})
	}, [status, references, warnRemove])

	return (
		<div className="media-element">
			<span
				title={capitalize(status)}
				style={{ color }}>lens</span>
			<span>
				<span>{title}</span>
				{downloading && <>
					<span className="monospace">{download.eta}</span>
					<progress
						value={parseFloat(download.percent) / 100}
						title={download.percent}></progress>
				</>}
			</span>
			<button
				type="button"
				className="symbol"
				title={downloading ? 'Cancel Download' : 'Remove'}
				onClick={removeMediaWithWarning}
				disabled={status === STATUS.PENDING}>close</button>
		</div>
	)
}

MediaElement.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	status: string.isRequired,
	references: number.isRequired,
	title: string.isRequired,
	download: exact({
		eta: string,
		percent: string
	}).isRequired,
	warnRemove: bool.isRequired,
	dispatch: func.isRequired
}

export default MediaElement
