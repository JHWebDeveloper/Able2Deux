import React, { useCallback } from 'react'
import { bool, func, number, oneOfType, string } from 'prop-types'

import { download, updateStateFromEvent } from 'actions'
import { useValidURL } from 'hooks'

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

const Downloader = ({ optimize, output, disableRateLimit, dispatch }) => {
	const [ url, isValidURL, setURL ] = useValidURL('')

	const downloadWithSettings = useCallback(() => {
		dispatch(download({ url, optimize, output, disableRateLimit }))
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
				onChange={e => setURL(e.target.value)} />
			<button
				type="button"
				className="app-button"
				name="download"
				title="Download Video"
				aria-label="Download Video"
				disabled={!isValidURL}
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
