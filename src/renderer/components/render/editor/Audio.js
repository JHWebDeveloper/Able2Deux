import React, { memo, useCallback } from 'react'

import { updateMediaNestedStateFromEvent } from '../../../actions'
import { copySettings, applySettingsToAll } from '../../../actions/render'

import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'

const Audio = memo(({ id, onlyItem, mediaType, audio, editAll, dispatch }) => {
	const updateAudio = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'audio', e, editAll))
	}, [id, editAll])

	return (
		<DetailsWrapper
			summary="Audio"
			className="auto-columns"
			buttons={onlyItem ? false : createSettingsMenu([
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
							label: 'Audio File (.wav)',
							value: 'file'
						},
						{
							label: 'Video with Bars (.mp4)',
							value: 'bars'
						}
					]} />
			</fieldset>
		</DetailsWrapper>
	)
}, compareProps)

export default Audio
