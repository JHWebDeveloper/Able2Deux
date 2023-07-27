import React, { useCallback, useRef } from 'react'
import { bool, func, number, oneOfType, string } from 'prop-types'

import { download, updateState, updateStateFromEvent } from 'actions'
import { validURLRegex } from 'utilities'

import RadioSet from '../form_elements/RadioSet'

const optimizeButtons = [
	{
		label: 'Optimize Video Quality',
		value: 'quality'
	},
	{
		label: 'Optimize Download Time',
		value: 'download'
	}
]

const Downloader = ({ url, optimize, output, disableRateLimit, dispatch }) => {
	const isValidURL = useRef(false)

	const validateAndSetURL = useCallback(url => {
		isValidURL.current = validURLRegex.test(url)
		dispatch(updateState({ url }))
	}, [])

	const downloadWithSettings = useCallback(() => {
		dispatch(download({ url, optimize, output, disableRateLimit }))
		validateAndSetURL('')
	}, [url, optimize, output, disableRateLimit])

	const dispatchWithEvent = useCallback(e => {
		dispatch(updateStateFromEvent(e))
	}, [])

	return (
		<div id="downloader">
			<input
				type="text"
				name="url"
				title="Paste URL"
				aria-label="Paste URL"
				className="underline"
				placeholder="Paste URL here..."
				value={url}
				onChange={e => validateAndSetURL(e.target.value)} />
			<button
				type="button"
				className="app-button"
				name="download"
				title="Download Video"
				aria-label="Download Video"
				disabled={!isValidURL.current}
				onClick={downloadWithSettings}>
				Download
			</button>
			<span>
				<RadioSet
					name="optimize"
					state={optimize}
					onChange={dispatchWithEvent}
					buttons={optimizeButtons} />
			</span>
		</div>
	)
}

Downloader.propTypes = {
	optimize: string.isRequired,
	output: string.isRequired,
	disableRateLimit: oneOfType([bool, number]),
	dispatch: func.isRequired
}

export default Downloader
