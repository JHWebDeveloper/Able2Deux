import React, { useCallback, useMemo } from 'react'
import { bool, func, number, oneOfType, string } from 'prop-types'

import { download, updateState, updateStateFromEvent } from 'actions'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import RadioSet from '../form_elements/RadioSet'

const OPTIMIZE_BUTTONS = Object.freeze([
	{
		label: 'Optimize Video Quality',
		value: 'quality'
	},
	{
		label: 'Optimize Download Time',
		value: 'download'
	}
])

const STYLE_INCREASE_ICON_SIZE = Object.freeze({
	scale: '1.35',
	translate: '0 8%'
})

const validURLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const Downloader = ({ url, optimize, output, disableRateLimit, dispatch }) => {
	const isInvalidURL = useMemo(() => !validURLRegex.test(url), [url])

	const startDownload = useCallback(() => {
		dispatch(updateState({ url: '' }))
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
			<ButtonWithIcon
				label="Download"
				icon="download"
				title="Download Media"
				onClick={startDownload}
				disabled={isInvalidURL}
				iconStyle={STYLE_INCREASE_ICON_SIZE} />
			<RadioSet
				label="Optimize"
				hideLabel
				name="optimize"
				state={optimize}
				onChange={dispatchWithEvent}
				buttons={OPTIMIZE_BUTTONS} />
		</div>
	)
}

Downloader.propTypes = {
	url: string,
	optimize: string.isRequired,
	output: string.isRequired,
	disableRateLimit: oneOfType([bool, number]),
	dispatch: func.isRequired
}

export default Downloader
