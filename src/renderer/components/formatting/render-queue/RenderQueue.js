import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, func, object } from 'prop-types'
import toastr from 'toastr'

import { PrefsContext } from 'store'
import * as STATUS from 'status'

import {
	cancelRender,
	disableWarningAndSave,
	removeLocationAndSave,
	render,
	startOver,
	updateMediaState
} from 'actions'

import {
	detectTabExit,
	toastrOpts,
	warn
} from 'utilities'

import RenderElement from './RenderElement'

const { interop } = window.ABLE2

const startOverMessage = 'Start Over?'
const startOverDetail = 'All entries will be cleared and media deleted. This cannot be undone. Proceed?'

const RenderQueue = props => {
	const { media, batch, saveLocations, closeRenderQueue, dispatch } = props
	const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
	const { warnings } = preferences
	const navigate = useNavigate()
	const backOrCancelBtn = useRef(null)

	const {
		renderOutput,
		renderFrameRate,
		customFrameRate,
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
			closeRenderQueue()
			dispatch(startOver())
			navigate('/')
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('startOver'))
		}
	}), [warnings.startOver])

	const containFocus = useCallback(detectTabExit(() => {
		backOrCancelBtn.current.focus()
	}), [backOrCancelBtn])

	const removeLocation = useCallback(id => {
		dispatchPrefs(removeLocationAndSave(id))
	}, [])

	useEffect(() => {
		interop.disablePrefs()

		dispatch(render({
			media,
			batch,
			saveLocations,
			renderOutput,
			renderFrameRate,
			customFrameRate,
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
								aria-label="Back"
								ref={backOrCancelBtn}
								onClick={goBack}>Back</button>
							<button
								type="button"
								className="app-button"
								title="Start Over"
								aria-label="Start Over"
								onClick={backToMain}>Start Over</button>
						</>
					) : (
						<button
							type="button"
							className="app-button"
							title="Cancel All"
							aria-label="Cancel All"
							ref={backOrCancelBtn}
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
	dispatch: func.isRequired
}

export default RenderQueue
