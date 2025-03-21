import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, number, string } from 'prop-types'

import { STATUS } from 'constants'

import {
	capitalize,
	getStatusColor,
	secondsToTC
} from 'utilities'

const RenderQueueItem = ({
	id,
	refId,
	status,
	title,
	isLive,
	downloadETA,
	downloadPercent,
	removeMediaWarning,
	references,
	dispatch
}) => {
	const downloading = status === STATUS.DOWNLOADING
	const color = useMemo(() => getStatusColor(status), [status])
	const progress = useRef(null)
	const mediaElementTitle = capitalize(status).replace('_', ' ')
	const downloadBtnTitle = downloading ? isLive ? 'Stop Stream' : 'Cancel Download' : 'Remove'

	const removeElement = useCallback(() => {
		removeMediaWarning({ id, refId, status, title, references }, dispatch)
	}, [status, title, references, removeMediaWarning])

	useEffect(() => {
		if (downloading && downloadPercent > 0 && downloadPercent <= 1) {
			progress.current.value = downloadPercent
		}
	}, [downloadPercent, status])

	return (
		<div className="queue-item">
			<span
				title={mediaElementTitle}
				style={{ color }}>lens</span>
			<span>
				<span className="overlow-ellipsis">{title}</span>
				{downloading ? <>
					{!isLive ? <span className="monospace">{secondsToTC(downloadETA)}</span> : <></>}
					<progress
						ref={progress}
						data-status={status}></progress>
				</> : <></>}
			</span>
			<button
				type="button"
				className="symbol"
				title={downloadBtnTitle}
				aria-label={downloadBtnTitle}
				onClick={removeElement}>
				{downloading && isLive ? 'stop' : 'close'}
			</button>
		</div>
	)
}

RenderQueueItem.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	status: string.isRequired,
	title: string.isRequired,
	isLive: bool.isRequired,
	downloadETA: number,
	downloadPercent: number,
	removeMediaWarning: func.isRequired,
	references: number,
	dispatch: func.isRequired
}

export default RenderQueueItem
