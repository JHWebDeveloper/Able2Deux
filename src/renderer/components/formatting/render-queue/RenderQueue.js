import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { withRouter } from 'react-router-dom'
import toastr from 'toastr'

import { PrefsContext } from 'store/preferences'
import * as STATUS from 'status'

import {
	updateMediaState,
	render,
	cancelRender,
	startOver,
	removeLocationAndSave
} from 'actions'

import { toastrOpts, detectTabExit } from 'utilities'

import RenderElement from './RenderElement'

const { interop } = window.ABLE2

const RenderQueue = withRouter(params => {
	const { media, batch, saveLocations, closeRenderQueue, dispatch, history } = params
	const prefsContext = useContext(PrefsContext)
	const prefsDispatch = prefsContext.dispatch

	const {
		renderOutput,
		renderFrameRate,
		autoPNG,
		asperaSafe,
		concurrent
	} = prefsContext.preferences
	
	// eslint-disable-next-line no-extra-parens
	const complete = media.every(({ render }) => (
		render.status === STATUS.COMPLETE ||
		render.status === STATUS.CANCELLED ||
		render.status === STATUS.FAILED
	))

	const cancelAll = useCallback(() => {
		media.forEach(async ({ id, render }) => {
			dispatch(cancelRender(id, render.status))
		})
	}, [media])

	const goBack = useCallback(() => {
		media.forEach(item => {
			dispatch(updateMediaState(item.id, {
				exportFilename: '',
				render: {
					status:	STATUS.PENDING,
					percent: 0
				}
			}))
		})

		closeRenderQueue()
	}, [media])

	const backToMain = useCallback(() => {
		dispatch(startOver())
		history.push('/')
	}, [])

	const ref = useRef()

	const containFocus = useCallback(detectTabExit(() => {
		ref.current.focus()
	}), [ref])

	const removeLocation = useCallback(id => {
		prefsDispatch(removeLocationAndSave(id))
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
			asperaSafe,
			concurrent,
			goBack,
			removeLocation
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
		<div id="render-queue" onBlur={containFocus}>
			<div>
				<div>
					{media.map(({ id, mediaType, filename, exportFilename, render }) => (
						<RenderElement
							key={id}
							id={id}
							mediaType={mediaType}
							filename={filename}
							exportFilename={exportFilename}
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
								ref={ref}
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
							ref={ref}
							onClick={cancelAll}
							autoFocus>Cancel All</button>
					)}
				</div>
			</div>
		</div>
	)
})

export default RenderQueue
