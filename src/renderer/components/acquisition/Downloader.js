import React from 'react'
import { func, string, bool } from 'prop-types'

import { updateStateFromEvent } from '../../actions'
import { download } from '../../actions/acquisition'

import RadioSet from '../form_elements/RadioSet'

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const Downloader = ({ url, optimize, output, disableRateLimit, dispatch }) => (
	<div id="downloader">
		<input
			type="text"
			name="url"
			className="underline"
			value={url}
			onChange={e => dispatch(updateStateFromEvent(e))}
			placeholder="Paste URL here..." />
		<button
			type="button"
			className="app-button"
			name="download"
			title="Download Video"
			disabled={!urlRegex.test(url)}
			onClick={() => dispatch(download({ url, optimize, output, disableRateLimit }))}>
			Download
		</button>
		<span>
			<RadioSet
				name="optimize"
				state={optimize}
				onChange={e => dispatch(updateStateFromEvent(e))}
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

Downloader.propTypes = {
	url: string.isRequired,
	optimize: string.isRequired,
	output: string.isRequired,
	disableRateLimit: bool,
	dispatch: func.isRequired
}

export default Downloader
