import React, { useCallback } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import {
	applySettingsToAll,
	copySettings,
	updateMediaStateBySelectionFromEvent
} from 'actions'

import { createSettingsMenu, pipe } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'

const audioVideoTracksButtons = [
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

const audioExportFormatButtons = [
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

const Audio = ({ mediaType, audioVideoTracks, audioExportFormat, dispatch }) => {
	const updateAudio = useCallback(e => {
		dispatch(updateMediaStateBySelectionFromEvent(e))
	}, [])

	return (
		<>
			{mediaType === 'video' ? (
				<fieldset className="editor-option-column">
					<legend>Export As<span aria-hidden>:</span></legend>
					<RadioSet
						name="audioVideoTracks"
						state={audioVideoTracks}
						onChange={updateAudio}
						buttons={audioVideoTracksButtons} />
				</fieldset>
			) : <></>}
			<fieldset
				className="editor-option-column"
				disabled={audioVideoTracks !== 'audio' && mediaType !== 'audio'}>
				<legend>Format<span aria-hidden>:</span></legend>
				<RadioSet
					name="audioExportFormat"
					state={audioExportFormat}
					onChange={updateAudio}
					buttons={audioExportFormatButtons} />
			</fieldset>
		</>
	)
}

const AudioPanel = props => {
	const { multipleItems, audioVideoTracks, audioExportFormat, id, mediaType, dispatch } = props

	const settingsMenu = createSettingsMenu(multipleItems, [
		() => pipe(copySettings, dispatch)({ audioVideoTracks, audioExportFormat }),
		() => pipe(applySettingsToAll(id), dispatch)({ audioVideoTracks, audioExportFormat })
	])

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
	multipleItems: bool.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	audioVideoTracks: oneOf(['video_audio', 'video', 'audio']),
	audioExportFormat: oneOf(['wav', 'mp3', 'bars']),
	dispatch: func.isRequired
}

Audio.propTypes = propTypes
AudioPanel.propTypes = propTypes

export default AudioPanel
