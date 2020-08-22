import React, { memo, useCallback } from 'react'
import { bool, exact, func, oneOf, string } from 'prop-types'

import {
	updateMediaNestedStateFromEvent,
	copySettings,
	applySettingsToAll
} from '../../../actions'

import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'

const Audio = memo(({ id, isBatch, mediaType, audio, editAll, dispatch }) => {
	const updateAudio = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'audio', e, editAll))
	}, [id, editAll])

	return (
		<DetailsWrapper
			summary="Audio"
			className="auto-columns"
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ audio })),
				() => dispatch(applySettingsToAll(id, { audio }))
			])}
			open={mediaType === 'audio'}>
			{mediaType === 'video' && (
				<fieldset>
					<legend>Export As:</legend>
					<RadioSet
						name="exportAs"
						state={audio.exportAs}
						onChange={updateAudio}
						buttons={[
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
						]} />
				</fieldset>
			)}
			<fieldset disabled={audio.exportAs !== 'audio' && mediaType !== 'audio'}>
				<legend>Format:</legend>
				<RadioSet
					name="format"
					state={audio.format}
					onChange={updateAudio}
					buttons={[
						{
							label: '.wav',
							value: 'wav'
						},
						{
							label: '.mp3',
							value: 'mp3'
						},
						{
							label: '.mp4 + SMPTE color bars',
							value: 'bars'
						}
					]} />
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