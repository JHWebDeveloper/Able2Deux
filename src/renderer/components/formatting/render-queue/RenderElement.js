import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { func, number, string } from 'prop-types'

import { STATUS } from 'constants'
import { cancelRender } from 'actions'
import { capitalize, getStatusColor } from 'utilities'

const RenderElement = ({ id, mediaType, filename, exportFilename, renderStatus, renderPercent, dispatch }) => {
	const color = useMemo(() => getStatusColor(renderStatus), [renderStatus])
	const progress = useRef(null)
	const title = capitalize(renderStatus)

	const cancelCurrentRender = useCallback(() => {
		dispatch(cancelRender(id, renderStatus))
	}, [id, renderStatus])

	useEffect(() => {
		if (mediaType !== 'image' && renderPercent > 0 && renderPercent < 101) {
			progress.current.value = renderPercent / 100
		}

		if (renderStatus === STATUS.COMPLETE) progress.current.value = 1
	}, [renderPercent, renderStatus])
	
	return (
		<div className="media-element">
			<span
				title={title}
				aria-label={title}
				style={{ color }}>lens</span>
			<span>
				<input type="text" value={exportFilename || filename} readOnly />
				<span></span>
				<progress
					ref={progress}
					data-status={renderStatus}></progress>
			</span>
			<button
				type="button"
				className="symbol"
				title="Cancel Render"
				aria-label="Cancel Render"
				onClick={cancelCurrentRender}
				disabled={renderStatus === STATUS.COMPLETE}>close</button>
		</div>
	)
}

RenderElement.propTypes = {
	id: string.isRequired,
	mediaType: string.isRequired,
	filename: string.isRequired,
	exportFilename: string,
	renderStatus: string,
	renderPercent: number,
	dispatch: func.isRequired
}

export default RenderElement
