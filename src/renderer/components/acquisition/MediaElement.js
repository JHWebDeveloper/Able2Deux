import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, number, string } from 'prop-types'

import * as STATUS from 'status'

import {
	capitalize,
	getStatusColor,
	secondsToTC
} from 'utilities'

const MediaElement = props => {
	const { id, refId, status, title, isLive, downloadETA, downloadPercent, removeMediaWarning } = props
	const downloading = status === STATUS.DOWNLOADING
	const color = useMemo(() => getStatusColor(status), [status])
	const progress = useRef(null)
	const mediaElementTitle = capitalize(status).replace('_', ' ')
	const downloadBtnTitle = downloading ? isLive ? 'Stop Stream' : 'Cancel Download' : 'Remove'

	const removeElement = useCallback(() => {
		props.removeMediaWarning({ id, refId, status, title })
	}, [status, title, removeMediaWarning])

	const stopLiveDownload = useCallback(() => {
		window.ABLE2.interop.stopLiveDownload(id)
	}, [])

	useEffect(() => {
		if (downloading && downloadPercent > 0 && downloadPercent <= 1) {
			progress.current.value = downloadPercent
		}
	}, [downloadPercent, status])

	return (
		<div className="media-element">
			<span
				title={mediaElementTitle}
				style={{ color }}>lens</span>
			<span>
				<span>{title}</span>
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
				onClick={isLive ? stopLiveDownload : removeElement}>
				{downloading && isLive ? 'stop' : 'close'}
			</button>
		</div>
	)
}

MediaElement.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	status: string.isRequired,
	title: string.isRequired,
	isLive: bool.isRequired,
	downloadETA: number,
	downloadPercent: number,
	removeMediaWarning: func.isRequired
}

export default MediaElement
