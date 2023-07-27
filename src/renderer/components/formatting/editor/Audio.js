import React, { memo, useCallback } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	updateMediaStateBySelectionFromEvent
} from 'actions'

import {
	createSettingsMenu,
	objectsAreEqual,
	pipe
} from 'utilities'

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

const Audio = memo(({ mediaType, audioVideoTracks, audioExportFormat, dispatch }) => {
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
}, objectsAreEqual)

const AudioPanel = props => {
	const { audioVideoTracks, audioExportFormat, id, mediaType, copyToClipboard, dispatch } = props
	const audioProps = { audioVideoTracks, audioExportFormat }

	const settingsMenu = createSettingsMenu(props, [
		() => copyToClipboard(audioProps),
		() => pipe(applySettingsToSelection(id), dispatch)(audioProps),
		() => pipe(applySettingsToAll(id), dispatch)(audioProps)
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
	mediaType: oneOf(['video', 'image', 'gif', 'audio']).isRequired,
	audioVideoTracks: oneOf(['video_audio', 'video', 'audio']).isRequired,
	audioExportFormat: oneOf(['wav', 'mp3', 'bars']).isRequired,
	copyToClipboard: func.isRequired,
	dispatch: func.isRequired
}

Audio.propTypes = propTypes
AudioPanel.propTypes = propTypes

export default AudioPanel
