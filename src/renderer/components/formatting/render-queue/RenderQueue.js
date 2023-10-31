import React, { useCallback, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { arrayOf, func, object, oneOf, string } from 'prop-types'
import toastr from 'toastr'

import { PrefsContext } from 'store'
import { STATUS } from 'constants'
import { pipeAsync } from 'utilities'

import {
	cancelRender,
	removeLocationAndSave,
	render,
	startOver,
	updateMediaStateById
} from 'actions'

import { TOASTR_OPTIONS } from 'constants'
import { useWarning } from 'hooks'

import RenderElement from './RenderElement'
import ButtonWithIcon from '../../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const RenderQueue = props => {
	const { media, batchNameType, batchName, batchNamePrepend, batchNameAppend, saveLocations, closeRenderQueue, dispatch } = props
	const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
	const navigate = useNavigate()

	const {
		renderOutput,
		renderFrameRate,
		customFrameRate,
		autoPNG,
		asperaSafe,
		concurrent,
		batchNameSeparator,
		replaceSpaces,
		spaceReplacement,
		convertCase,
		casing
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
		message: 'Start Over?',
		detail: 'All media items will be cleared. This cannot be undone. Proceed?',
		onConfirm() {
			closeRenderQueue()
			dispatch(startOver())
			navigate('/')
		}
	})

	const removeLocation = useCallback(id => {
		dispatchPrefs(removeLocationAndSave(id))
	}, [])

	useEffect(() => {
		interop.disablePrefs()

		pipeAsync(render, dispatch)({
			media,
			batchNameType,
			batchName,
			batchNamePrepend,
			batchNameAppend,
			saveLocations,
			renderOutput,
			renderFrameRate,
			customFrameRate,
			autoPNG,
			asperaSafe,
			concurrent,
			batchNameSeparator,
			replaceSpaces,
			spaceReplacement,
			convertCase,
			casing,
			goBack,
			removeLocation
		})
	}, [])

	useEffect(() => {
		const atleastOneSuccess = media.some(item => item.renderStatus === STATUS.COMPLETE)

		if (complete && atleastOneSuccess) {
			toastr.success('Thank you for using Able2.', 'Your Files are Ready!', { ...TOASTR_OPTIONS, timeOut: 4000 })
		}

		if (complete) interop.enablePrefs()
	}, [complete])

	return (
		<div id="render-queue">
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
							<ButtonWithIcon
								label="Back"
								icon="arrow_back"
								onClick={goBack}
								autoFocus />
							<ButtonWithIcon
								label="Start Over"
								icon="restart_alt"
								onClick={() => backToMain()} />
						</>
					) : (
						<ButtonWithIcon
							label="Cancel All"
							icon="close"
							onClick={cancelAll}
							autoFocus />
					)}
				</div>
			</div>
		</div>
	)
}

RenderQueue.propTypes = {
	media: arrayOf(object).isRequired,
	batchNameType: oneOf(['replace', 'prepend_append']),
	batchName: string,
	batchNamePrepend: string,
	batchNameAppend: string,
	saveLocations: arrayOf(object).isRequired,
	closeRenderQueue: func.isRequired,
	dispatch: func.isRequired
}

export default RenderQueue
