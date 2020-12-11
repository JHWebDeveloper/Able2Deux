import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { withRouter } from 'react-router-dom'
import { arrayOf, func, object } from 'prop-types'
import toastr from 'toastr'

import { PrefsContext } from 'store/preferences'
import * as STATUS from 'status'

import {
	updateMediaState,
	render,
	cancelRender,
	startOver,
	removeLocationAndSave,
	disableWarningAndSave
} from 'actions'

import { toastrOpts, detectTabExit, warn } from 'utilities'

import RenderElement from './RenderElement'

const { interop } = window.ABLE2

const startOverMessage = 'Start Over?'
const startOverDetail = 'All entries will be cleared and media deleted. This cannot be undone. Proceed?'

const RenderQueue = params => {
	const { media, batch, saveLocations, closeRenderQueue, dispatch, history } = params
	const prefsContext = useContext(PrefsContext)
	const prefsDispatch = prefsContext.dispatch
	const { warnings } = prefsContext.preferences

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

	const backToMain = useCallback(() => warn({
		message: startOverMessage,
		detail: startOverDetail,
		enabled: warnings.startOver,
		callback() {
			dispatch(startOver())
			history.push('/')
		},
		checkboxCallback() {
			prefsDispatch(disableWarningAndSave('startOver'))
		}
	}), [warnings.startOver])

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
}

RenderQueue.propTypes = {
	media: arrayOf(object).isRequired,
	batch: object.isRequired,
	saveLocations: arrayOf(object).isRequired,
	closeRenderQueue: func.isRequired,
	dispatch: func.isRequired,
	history: object.isRequired
}

export default withRouter(RenderQueue)
