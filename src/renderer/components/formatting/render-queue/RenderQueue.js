import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, func, object, oneOf, string } from 'prop-types'
import toastr from 'toastr'

import { PrefsContext } from 'store'
import { pipeAsync } from 'utilities'
import * as STATUS from 'status'

import {
	cancelRender,
	removeLocationAndSave,
	render,
	startOver,
	updateMediaStateById
} from 'actions'

import { useWarning } from 'hooks'
import { detectTabExit, toastrOpts } from 'utilities'

import RenderElement from './RenderElement'

const { interop } = window.ABLE2

const startOverMessage = 'Start Over?'
const startOverDetail = 'All entries will be cleared and media deleted. This cannot be undone. Proceed?'

const RenderQueue = props => {
	const { media, batchName, batchNameType, saveLocations, closeRenderQueue, dispatch } = props
	const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
	const navigate = useNavigate()
	const backOrCancelBtn = useRef(null)

	const {
		renderOutput,
		renderFrameRate,
		customFrameRate,
		autoPNG,
		asperaSafe,
		concurrent
	} = preferences

	// eslint-disable-next-line no-extra-parens
	const complete = media.every(({ renderStatus }) => (
		renderStatus === STATUS.COMPLETE ||
		renderStatus === STATUS.CANCELLED ||
		renderStatus === STATUS.FAILED
	))

	const cancelAll = useCallback(() => {
		media.forEach(async ({ id, renderStatus }) => {
			dispatch(cancelRender(id, renderStatus))
		})
	}, [media])

	const goBack = useCallback(() => {
		media.forEach(({ id }) => {
			dispatch(updateMediaStateById(id, {
				exportFilename: '',
				renderStatus:	STATUS.PENDING,
				renderPercent: 0
			}))
		})

		closeRenderQueue()
	}, [media])

	const backToMain = useWarning({
		name: 'startOver',
		message: startOverMessage,
		detail: startOverDetail,
		callback() {
			closeRenderQueue()
			dispatch(startOver())
			navigate('/')
		}
	})

	const containFocus = useCallback(detectTabExit(() => {
		backOrCancelBtn.current.focus()
	}), [backOrCancelBtn])

	const removeLocation = useCallback(id => {
		dispatchPrefs(removeLocationAndSave(id))
	}, [])

	useEffect(() => {
		interop.disablePrefs()

		pipeAsync(render, dispatch)({
			media,
			batchName,
			batchNameType,
			saveLocations,
			renderOutput,
			renderFrameRate,
			customFrameRate,
			autoPNG,
			asperaSafe,
			concurrent,
			goBack,
			removeLocation
		})
	}, [])

	useEffect(() => {
		const atleastOneSuccess = media.some(item => item.renderStatus === STATUS.COMPLETE)

		if (complete && atleastOneSuccess) {
			toastr.success('Thank you for using Able2.', 'Your Files are Ready!', { ...toastrOpts, timeOut: 4000 })
		}

		if (complete) interop.enablePrefs()
	}, [complete])

	return (
		<div id="render-queue" onBlur={containFocus}>
			<div>
				<div>
					{media.map(({ id, mediaType, filename, exportFilename, renderPercent, renderStatus }) => (
						<RenderElement
							key={id}
							id={id}
							mediaType={mediaType}
							filename={filename}
							exportFilename={exportFilename}
							renderPercent={renderPercent}
							renderStatus={renderStatus}
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
								onClick={() => backToMain()}>Start Over</button>
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
	batchName: string,
	batchNameType: oneOf(['replace', 'prepend', 'append']),
	saveLocations: arrayOf(object).isRequired,
	closeRenderQueue: func.isRequired,
	dispatch: func.isRequired
}

export default RenderQueue
