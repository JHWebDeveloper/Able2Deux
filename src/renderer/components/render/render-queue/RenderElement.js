import React, { useMemo } from 'react'

import { COMPLETE } from '../../../status/types'
import { cancelRender } from '../../../actions/render'
import { capitalize, getStatusColor, replaceTokens } from '../../../utilities'

const RenderElement = ({ id, filename, render, dispatch }) => {
	const color = useMemo(() => getStatusColor(render.status), [render.status])

	return (
		<div className="media-element">
			<span
				title={capitalize(render.status)}
				style={{ color }}>lens</span>
			<span>
				<span>{filename || replaceTokens('Able2 Export $t $d')}</span>
				<span></span>
				<progress value={render.percent / 100}></progress>
			</span>
			<button
				type="button"
				className="symbol"
				title="Cancel Render"
				onClick={() => dispatch(cancelRender(id, render.status))}
				disabled={render.status === COMPLETE}>close</button>
		</div>
	)
}

export default RenderElement
