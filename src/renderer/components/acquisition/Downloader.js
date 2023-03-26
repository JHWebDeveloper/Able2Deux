import React, { useCallback, useMemo } from 'react'
import { bool, func, number, oneOfType, string } from 'prop-types'

import { download, updateStateFromEvent } from 'actions'

import RadioSet from '../form_elements/RadioSet'

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

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
	const badURL = useMemo(() => !urlRegex.test(url), [url])

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
				onChange={dispatchWithEvent} />
			<button
				type="button"
				className="app-button"
				name="download"
				title="Download Video"
				aria-label="Download Video"
				disabled={badURL}
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
	url: string.isRequired,
	optimize: string.isRequired,
	output: string.isRequired,
	disableRateLimit: oneOfType([bool, number]),
	dispatch: func.isRequired
}

export default Downloader
