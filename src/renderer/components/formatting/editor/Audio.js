import React, { memo, useCallback } from 'react'
import { bool, exact, func, oneOf, string } from 'prop-types'

import {
	updateMediaNestedStateFromEvent,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'

const exportAsButtons = [
	{
		label: 'Video + Audio',
		value: 'video_audio'
	},
	{
		label: 'Video Only',
		value: 'video'
	},
	{
		label: 'Audio Only',
		value: 'audio'
	}
]

const formatButtons = [
	{
		label: '.wav',
		value: 'wav'
	},
	{
		label: '.mp3',
		value: 'mp3'
	},
	{
		label: '.mp4 + color bars',
		value: 'bars'
	}
]

const Audio = memo(({ id, isBatch, mediaType, audio, editAll, dispatch }) => {
	const updateAudio = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'audio', e, editAll))
	}, [id, editAll])

	return (
		<DetailsWrapper
			summary="Audio"
			className="editor-panel auto-columns"
			buttons={isBatch ? createSettingsMenu([
				() => dispatch(copySettings({ audio })),
				() => dispatch(applySettingsToAll(id, { audio }))
			]) : []}
			initOpen={mediaType === 'audio'}>
			{mediaType === 'video' ? (
				<fieldset className="editor-option-column">
					<legend>Export As:</legend>
					<RadioSet
						name="exportAs"
						state={audio.exportAs}
						onChange={updateAudio}
						buttons={exportAsButtons} />
				</fieldset>
			) : <></>}
			<fieldset
				className="editor-option-column"
				disabled={audio.exportAs !== 'audio' && mediaType !== 'audio'}>
				<legend>Format:</legend>
				<RadioSet
					name="format"
					state={audio.format}
					onChange={updateAudio}
					buttons={formatButtons} />
			</fieldset>
		</DetailsWrapper>
	)
}, compareProps)

Audio.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	audio: exact({
		exportAs: oneOf(['video_audio', 'video', 'audio']),
		format: oneOf(['wav', 'mp3', 'bars'])
	}),
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Audio
