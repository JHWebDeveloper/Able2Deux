import React, { useCallback, useContext, useEffect } from 'react'
import toastr from 'toastr'

import { PrefsContext } from '../../../store/preferences'
import * as STATUS from '../../../status/types'
import { render, cancelRender } from '../../../actions/render'
import { toastrOpts } from '../../../utilities'

import RenderElement from './RenderElement'

const RenderQueue = ({ media, batchName, saveLocations, closeRenderQueue, dispatch }) => {
	const { renderOutput, concurrent } = useContext(PrefsContext)
	
	const complete = media.every(({ render }) => (
		render.status === STATUS.COMPLETE ||
		render.status === STATUS.CANCELLED ||
		render.status === STATUS.FAILED
	))

	const cancelAll = useCallback(() => Promise.all(media.map(({ id, render }) => {
		dispatch(cancelRender(id, render.status))
	})), [media])

	useEffect(() => {
		dispatch(render({
			media,
			batchName,
			saveLocations,
			renderOutput,
			concurrent
		}))
	}, [])

	useEffect(() => {
		const atleastOneSuccess = media.some(({ render }) => render.status === STATUS.COMPLETE)

		if (complete && atleastOneSuccess) {
			toastr.success('Thank you for using Able2.', 'Your Files are Ready!', { ...toastrOpts, timeOut: 4000 })
		}
	}, [complete])

	return (
		<div id="render-queue">
			<div>
				<div>
					{media.map(({ id, filename, render }) => (
						<RenderElement
							key={id}
							id={id}
							filename={filename}
							render={render}
							dispatch={dispatch} />)
					)}
				</div>
				<div>
					{complete ? (
						<>
							<button
								type="button"
								className="app-button"
								title="Back"
								onClick={closeRenderQueue}>Back</button>
							<button
								type="button"
								className="app-button"
								title="Start Over">Start Over</button>
						</>
					) : (
						<button
							type="button"
							className="app-button"
							title="Cancell All"
							onClick={cancelAll}>Cancel All</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default RenderQueue
