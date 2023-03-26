import React, { useCallback, useContext, useMemo } from 'react'
import { bool, func, exact, string, oneOf } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	applySettingsToAll,
	copySettings,
	disableWarningAndSave,
	toggleMediaNestedCheckbox,
	updateMediaNestedStateFromEvent
} from 'actions'

import {
	createSettingsMenu,
	has11pmBackground,
	warn
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import Checkbox from '../../form_elements/Checkbox'

const message = 'A source on top is not for aesthetics!'
const detail = 'This option shoud only be selected if the source would obscure important details or appear illegible at the bottom of the video. If you are using this option for any other reason please choose cancel.'

const Source = ({ id, source, background, editAll, dispatch }) => {
	const prefsCtx = useContext(PrefsContext)
	const prefsDispatch = prefsCtx.dispatch
	const { warnings } = prefsCtx.preferences
	const { prefix, onTop } = source

	const maxLength = useMemo(() => {
		let len = has11pmBackground(background) ? onTop ? 44 : 38 : 51

		if (!prefix) len += 8
		
		return len
	}, [background, prefix, onTop])

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
		<>
			<fieldset>
				<legend>Source Name<span aria-hidden>:</span></legend>
				<input
					type="text"
					name="sourceName"
					title="Source Name"
					aria-label="Source Name"
					className="underline"
					placeholder="If none, leave blank"
					list="source-suggestions"
					value={source.sourceName}
					onChange={updateSourceName}
					maxLength={maxLength} />
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
		</>
	)
}

const SourcePanel = props => {
	const { isBatch, source, id, dispatch } = props

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({ source })),
		() => dispatch(applySettingsToAll(id, { source }))
	]) : [], [isBatch, id, source])

	return (
		<AccordionPanel
			heading="Source"
			id="source"
			className="editor-options"
			buttons={settingsMenu}
			initOpen>
			<Source {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	source: exact({
		sourceName: string,
		prefix: bool.isRequired,
		onTop: bool.isRequired,
		data: string
	}),
	background: oneOf(['blue', 'grey', 'light_blue', 'dark_blue', 'teal', 'tan', 'alpha', 'color']).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

Source.propTypes = propTypes
SourcePanel.propTypes = propTypes

export default SourcePanel
