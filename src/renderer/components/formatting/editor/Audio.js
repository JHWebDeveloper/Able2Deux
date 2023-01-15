import React, { memo, useCallback, useMemo } from 'react'
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

const Audio = memo(({ id, mediaType, audio, editAll, dispatch }) => {
	const updateAudio = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'audio', e, editAll))
	}, [id, editAll])

	return (
		<>
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
		</>
	)
}, compareProps)

const AudioPanel = props => {
	const { isBatch, audio, id, mediaType, dispatch } = props

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({ audio })),
		() => dispatch(applySettingsToAll(id, { audio }))
	]) : [], [isBatch, id, audio])

	return (
		<DetailsWrapper
			summary="Audio"
			className="editor-panel auto-columns"
			buttons={settingsMenu}
			initOpen={mediaType === 'audio'}>
			<Audio {...props} />
		</DetailsWrapper>
	)
}

const propTypes = {
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

Audio.propTypes = propTypes
AudioPanel.propTypes = propTypes

export default AudioPanel
