import React, { memo, useCallback, useContext } from 'react'
import { bool, func, exact, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	updateMediaNestedStateFromEvent,
	toggleMediaNestedCheckbox,
	copySettings,
	applySettingsToAll,
	disableWarningAndSave
} from 'actions'

import { compareProps, createSettingsMenu, warn } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Checkbox from '../../form_elements/Checkbox'

const message = 'A source on top is not for aesthetics!'
const detail = 'This option shoud only be selected if the source would obscure important details or appear illegible at the bottom of the video. If you are using this option for any other reason please choose cancel.'

const Source = memo(({ id, isBatch, source, editAll, dispatch }) => {
	const prefsCtx = useContext(PrefsContext)
	const prefsDispatch = prefsCtx.dispatch
	const { warnings } = prefsCtx.preferences

	const updateSourceName = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'source', e, editAll))
	}, [id, editAll])

	const toggleSourceOption = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'source', e, editAll))
	}, [id, editAll])

	const sourceOnTopWarning = useCallback(e => warn({
		message,
		detail,
		enabled: warnings.sourceOnTop && !source.onTop,
		callback() {
			toggleSourceOption(e)
		},
		checkboxCallback() {
			prefsDispatch(disableWarningAndSave('sourceOnTop'))
		}
	}), [id, editAll, warnings.sourceOnTop, source.onTop])

	return (
		<DetailsWrapper
			summary="Source"
			className="editor-panel"
			buttons={isBatch ? createSettingsMenu([
				() => dispatch(copySettings({ source })),
				() => dispatch(applySettingsToAll(id, { source }))
			]) : []}
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
				onChange={sourceOnTopWarning} />
		</DetailsWrapper>
	)
}, compareProps)

Source.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
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
