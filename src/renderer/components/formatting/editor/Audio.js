import React, { useCallback, useMemo } from 'react'
import { bool, exact, func, oneOf, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	updateMediaNestedStateFromEvent
} from 'actions'

import { createSettingsMenu, pipe } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
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

const Audio = ({ id, mediaType, audio, editAll, dispatch }) => {
	const updateAudio = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'audio', e, editAll))
	}, [id, editAll])

	return (
		<>
			{mediaType === 'video' ? (
				<fieldset className="editor-option-column">
					<legend>Export As<span aria-hidden>:</span></legend>
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
				<legend>Format<span aria-hidden>:</span></legend>
				<RadioSet
					name="format"
					state={audio.format}
					onChange={updateAudio}
					buttons={formatButtons} />
			</fieldset>
		</>
	)
}

const AudioPanel = props => {
	const { isBatch, audio, id, mediaType, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => pipe({ audio })(copySettings, dispatch),
		() => pipe({ audio })(val => applySettingsToAll(id, val), dispatch)
	]), [isBatch, id, audio])

	return (
		<AccordionPanel
			heading="Audio"
			id="audio"
			className="editor-options auto-columns"
			buttons={settingsMenu}
			initOpen={mediaType === 'audio'}>
			<Audio {...props} />
		</AccordionPanel>
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
