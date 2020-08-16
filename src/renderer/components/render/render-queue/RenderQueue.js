import React, { useCallback, useContext, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import toastr from 'toastr'

import { PrefsContext } from '../../../store/preferences'
import * as STATUS from '../../../status/types'
import { updateMediaNestedState } from '../../../actions'
import { render, cancelRender, startOver } from '../../../actions/render'
import { toastrOpts } from '../../../utilities'

import RenderElement from './RenderElement'

const { interop } = window.ABLE2

const RenderQueue = withRouter(params => {
	const { media, batch, saveLocations, closeRenderQueue, dispatch, history } = params
	const { renderOutput, renderFrameRate, autoPNG, concurrent } = useContext(PrefsContext)
	
	const complete = media.every(({ render }) => (
		render.status === STATUS.COMPLETE ||
		render.status === STATUS.CANCELLED ||
		render.status === STATUS.FAILED
	))

	const cancelAll = useCallback(() => Promise.all(media.map(({ id, render }) => {
		dispatch(cancelRender(id, render.status))
	})), [media])

	const goBack = useCallback(() => {
		media.forEach(item => {
			dispatch(updateMediaNestedState(item.id, 'render', {
				status:	STATUS.PENDING,
				percent: 0
			}))
		})

		closeRenderQueue()
	}, [media])

	const backToMain = useCallback(() => {
		dispatch(startOver())
		history.push('/')
	}, [])

	useEffect(() => {
		interop.disablePrefs()

		dispatch(render({
			media,
			batch,
			saveLocations,
			renderOutput,
			renderFrameRate,
			autoPNG,
			concurrent,
			goBack
		}))
	}, [])

	useEffect(() => {
		const atleastOneSuccess = media.some(({ render }) => render.status === STATUS.COMPLETE)

		if (complete && atleastOneSuccess) {
			toastr.success('Thank you for using Able2.', 'Your Files are Ready!', { ...toastrOpts, timeOut: 4000 })
		}

		if (complete) interop.enablePrefs()
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
								onClick={goBack}>Back</button>
							<button
								type="button"
								className="app-button"
								title="Start Over"
								onClick={backToMain}>Start Over</button>
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
})

export default RenderQueue
