import React, { memo, useMemo } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset
} from 'actions'

import { MEDIA_TYPES, OPTION_SET } from 'constants'

import {
	createObjectPicker,
	createSettingsMenu,
	extractRelevantMediaProps,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'

const extractAudioProps = createObjectPicker(['audioVideoTracks', 'audioExportFormat'])

const Audio = memo(({ mediaType, audioVideoTracks, audioExportFormat, updateSelectionFromEvent }) => (
	<>
		{mediaType === 'video' ? (
			<RadioSet
				label="Export As"
				name="audioVideoTracks"
				state={audioVideoTracks}
				onChange={updateSelectionFromEvent}
				options={OPTION_SET.audioVideoTracks} />
		) : <></>}
		<RadioSet
			label="Format"
			name="audioExportFormat"
			disabled={audioVideoTracks !== 'audio' && mediaType !== 'audio'}
			state={audioExportFormat}
			onChange={updateSelectionFromEvent}
			options={OPTION_SET.audioExportFormat} />
	</>
), objectsAreEqual)

const AudioPanel = ({ id, multipleItems, multipleItemsSelected, dispatch, ...rest }) => {
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
			options={settingsMenu}
			initOpen={rest.mediaType === 'audio'}>
			<Audio {...rest} />
		</AccordionPanel>
	)
}

const sharedPropTypes = {
	mediaType: oneOf(MEDIA_TYPES).isRequired,
	audioVideoTracks: oneOf(['video_audio', 'video', 'audio']).isRequired,
	audioExportFormat: oneOf(['wav', 'mp3', 'bars']).isRequired,
	updateSelectionFromEvent: func.isRequired,
}

AudioPanel.propTypes = {
	...sharedPropTypes,
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	dispatch: func.isRequired
}

Audio.propTypes = sharedPropTypes

export default AudioPanel
