import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import * as STATUS from '../../status/types'
import { removeMedia } from '../../actions'
import { warn, capitalize, getStatusColor } from '../../utilities'

const { interop } = window.ABLE2

const MediaElement = ({ id, refId, status, references, title, isLive, download, warnRemove, dispatch }) => {
	const downloading = status === STATUS.DOWNLOADING
	const color = useMemo(() => getStatusColor(status), [status])
	const ref = useRef()

	const removeMediaWithWarning = useCallback(() => {
		warn({
			message: `Remove "${title}"?`,
			detail: `${downloading ? 'The current download will be canceled. ' : ''}This cannot be undone. Proceed?`,
			enabled: warnRemove,
			callback() { dispatch(removeMedia({ id, refId, status, references })) }
		})
	}, [status, references, warnRemove])

	const stopLiveDownload = useCallback(() => {
		interop.stopLiveDownload(id)
	}, [id])

	useEffect(() => {
		if (downloading) {
			const percent = parseFloat(download.percent)

			if (percent > 0 && percent < 101) ref.current.value = percent / 100
		}
	}, [download, status])

	return (
		<div className="media-element">
			<span
				title={capitalize(status)}
				style={{ color }}>lens</span>
			<span>
				<span>{title}</span>
				{downloading && <>
					{!isLive && <span className="monospace">{download.eta}</span>}
					<progress
						ref={ref}
						data-status={status}></progress>
				</>}
			</span>
			<button
				type="button"
				className="symbol"
				title={downloading ? isLive ? 'Stop Stream' : 'Cancel Download' : 'Remove'}
				onClick={isLive ? stopLiveDownload : removeMediaWithWarning}
				disabled={status === STATUS.PENDING}>
				{downloading && isLive ? 'stop' : 'close'}
			</button>
		</div>
	)
}

MediaElement.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	status: string.isRequired,
	references: number.isRequired,
	title: string.isRequired,
	isLive: bool.isRequired,
	download: exact({
		eta: string,
		percent: string
	}).isRequired,
	warnRemove: bool.isRequired,
	dispatch: func.isRequired
}

export default MediaElement
