import React, { memo, useCallback, useContext } from 'react'
import { bool, func, exact, string } from 'prop-types'

import { PrefsContext } from '../../../store/preferences'

import {
	updateMediaNestedStateFromEvent,
	toggleMediaNestedCheckbox
} from '../../../actions'

import { copySettings, applySettingsToAll } from '../../../actions/render'
import { compareProps, createSettingsMenu, warn } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Checkbox from '../../form_elements/Checkbox'

const sourceOnTopWarning = (enabled, callback) => {
	warn({
		message: 'A source on top is not for aesthetics!',
		detail: 'This option shoud only be selected if the source would obscure important details or appear illegible at the bottom of the video. If you are using this option for any other reason please choose cancel.',
		enabled,
		callback
	})
}

const Source = memo(({ id, onlyItem, source, editAll, dispatch }) => {
	const { warnings } = useContext(PrefsContext)

	const updateSourceName = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'source', e, editAll))
	}, [id, editAll])

	const toggleSourceOption = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'source', e, editAll))
	}, [id, editAll])

	const sourceOnTopWithWarning = useCallback(e => {
		e.persist()

		sourceOnTopWarning(warnings.sourceOnTop && !source.onTop, () => {
			toggleSourceOption(e)
		})
	}, [id, editAll, warnings.sourceOnTop, source.onTop])

	return (
		<DetailsWrapper
			summary="Source"
			buttons={onlyItem ? false : createSettingsMenu([
				() => dispatch(copySettings({ source })),
				() => dispatch(applySettingsToAll(id, { source }))
			])}
			open>
			<fieldset>
				<legend>Source Name:</legend>
				<input
					type="text"
					name="sourceName"
					title="Source Name"
					className="underline"
					value={source.sourceName}
					onChange={updateSourceName}
					list="source-suggestions"
					maxLength="51"
					placeholder="If none, leave blank" />
			</fieldset>
			<Checkbox
				label={'Add "Source: " to beginning'}
				name="prefix"
				checked={source.prefix}
				onChange={toggleSourceOption} />
			<Checkbox
				label="Place source at top of video"
				name="onTop"
				checked={source.onTop}
				onChange={sourceOnTopWithWarning} />
		</DetailsWrapper>
	)
}, compareProps)

Source.propTypes = {
	id: string.isRequired,
	source: exact({
		sourceName: string,
		prefix: bool.isRequired,
		onTop: bool.isRequired,
		data: string
	}),
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Source
