import React, { useCallback, useMemo } from 'react'
import { bool, func, number, oneOfType, string } from 'prop-types'

import { updateStateFromEvent, download } from 'actions'

import RadioSet from '../form_elements/RadioSet'

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

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
				className="underline"
				value={url}
				onChange={dispatchWithEvent }
				placeholder="Paste URL here..." />
			<button
				type="button"
				className="app-button"
				name="download"
				title="Download Video"
				disabled={badURL }
				onClick={downloadWithSettings}>
				Download
			</button>
			<span>
				<RadioSet
					name="optimize"
					state={optimize}
					onChange={dispatchWithEvent}
					buttons={[
						{
							label: 'Optimize Video Quality',
							value: 'quality'
						},
						{
							label: 'Optimize Download Time',
							value: 'download'
						}
					]} />
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
