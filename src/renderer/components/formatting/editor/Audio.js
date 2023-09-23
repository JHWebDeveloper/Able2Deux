import React, { memo, useMemo } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset
} from 'actions'

import {
	createObjectPicker,
	createSettingsMenu,
	extractRelevantMediaProps,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'

const AUDIO_VIDEO_TRACKS_BUTTONS = Object.freeze([
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
])

const AUDIO_EXPORT_FORMAT_BUTTONS = Object.freeze([
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
])

const extractAudioProps = createObjectPicker(['audioVideoTracks', 'audioExportFormat'])

const Audio = memo(({ mediaType, audioVideoTracks, audioExportFormat, updateSelectionFromEvent }) => (
	<>
		{mediaType === 'video' ? (
			<RadioSet
				label="Export As"
				name="audioVideoTracks"
				state={audioVideoTracks}
				onChange={updateSelectionFromEvent}
				buttons={AUDIO_VIDEO_TRACKS_BUTTONS} />
		) : <></>}
		<RadioSet
			label="Format"
			name="audioExportFormat"
			disabled={audioVideoTracks !== 'audio' && mediaType !== 'audio'}
			state={audioExportFormat}
			onChange={updateSelectionFromEvent}
			buttons={AUDIO_EXPORT_FORMAT_BUTTONS} />
	</>
), objectsAreEqual)

const AudioPanel = props => {
	const { id, multipleItems, multipleItemsSelected, mediaType, dispatch } = props

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractRelevantMediaProps, extractAudioProps)),
			() => dispatch(applyToSelection(id, extractRelevantMediaProps, extractAudioProps)),
			() => dispatch(applyToAll(id, extractRelevantMediaProps, extractAudioProps)),
			() => dispatch(saveAsPreset(id, extractRelevantMediaProps, extractAudioProps))
		])
	), [multipleItems, multipleItemsSelected, id])

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
	multipleItemsSelected: bool.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']).isRequired,
	audioVideoTracks: oneOf(['video_audio', 'video', 'audio']).isRequired,
	audioExportFormat: oneOf(['wav', 'mp3', 'bars']).isRequired,
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

Audio.propTypes = propTypes
AudioPanel.propTypes = propTypes

export default AudioPanel
