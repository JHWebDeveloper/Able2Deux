import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import * as STATUS from 'status'

import {
	capitalize,
	getStatusColor,
	secondsToTC
} from 'utilities'

const { interop } = window.ABLE2

const MediaElement = props => {
	const { id, refId, status, title, isLive, download, removeMediaWarning } = props
	const downloading = status === STATUS.DOWNLOADING
	const color = useMemo(() => getStatusColor(status), [status])
	const progress = useRef()

	const removeElement = useCallback(() => {
		props.removeMediaWarning({ id, refId, status, title })
	}, [status, title, removeMediaWarning])

	const stopLiveDownload = useCallback(() => {
		interop.stopLiveDownload(id)
	}, [])

	useEffect(() => {
		if (downloading) {
			const { percent } = download

			if (percent > 0 && percent <= 1) progress.current.value = percent
		}
	}, [download, status])

	return (
		<div className="media-element">
			<span
				title={capitalize(status).replace('_', ' ')}
				style={{ color }}>lens</span>
			<span>
				<span>{title}</span>
				{downloading ? <>
					{!isLive ? <span className="monospace">{secondsToTC(download.eta)}</span> : <></>}
					<progress
						ref={progress}
						data-status={status}></progress>
				</> : <></>}
			</span>
			<button
				type="button"
				className="symbol"
				title={downloading ? isLive ? 'Stop Stream' : 'Cancel Download' : 'Remove'}
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
	download: exact({
		eta: number,
		percent: number
	}).isRequired,
	removeMediaWarning: func.isRequired
}

export default MediaElement
