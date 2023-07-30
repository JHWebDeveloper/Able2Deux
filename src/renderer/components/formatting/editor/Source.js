import React, { memo, useCallback, useMemo } from 'react'
import { bool, func, string, oneOf } from 'prop-types'
import {
	applySettingsToAll,
	applySettingsToSelection,
	toggleMediaCheckbox,
	updateMediaStateBySelectionFromEvent
} from 'actions'

import { useWarning } from 'hooks'

import {
	createSettingsMenu,
	extractSourceProps,
	has11pmBackground,
	objectsAreEqual,
	pipe
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import Checkbox from '../../form_elements/Checkbox'

const message = 'A source on top is not for aesthetics!'
const detail = 'This option shoud only be selected if the source would obscure important details or appear illegible at the bottom of the video. If you are using this option for any other reason please choose cancel.'

const Source = memo(props => {
	const { id, sourceName, sourcePrefix, sourceOnTop, background, dispatch } = props

	const maxLength = useMemo(() => {
		let len = has11pmBackground(background) ? sourceOnTop ? 44 : 38 : 51

		if (!sourcePrefix) len += 8
		
		return len
	}, [background, sourcePrefix, sourceOnTop])

	const updateSourceName = useCallback(e => {
		dispatch(updateMediaStateBySelectionFromEvent(e))
	}, [])

	const toggleSourceOption = useCallback(e => {
		dispatch(toggleMediaCheckbox(id, e))
	}, [id])

	const warn = useWarning({
		name: 'sourceOnTop',
		message,
		detail,
		skip: sourceOnTop
	}, [id, sourceOnTop])

	const sourceOnTopWarning = useCallback(e => warn({
		callback() {
			toggleSourceOption(e)
		}
	}), [id, sourceOnTop, warn])

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
					value={sourceName}
					onChange={updateSourceName}
					maxLength={maxLength} />
			</fieldset>
			<Checkbox
				label={'Add "Source: " to beginning'}
				name="sourcePrefix"
				checked={sourcePrefix}
				onChange={toggleSourceOption} />
			<Checkbox
				label="Place source at top of video"
				name="sourceOnTop"
				checked={sourceOnTop}
				onChange={sourceOnTopWarning} />
		</>
	)
}, objectsAreEqual)

const SourcePanel = props => {
	const { id, copyToClipboard, dispatch } = props

	const settingsMenu = createSettingsMenu(props, [
		() => pipe(extractSourceProps, copyToClipboard)(props),
		() => pipe(extractSourceProps, applySettingsToSelection(id), dispatch)(props),
		() => pipe(extractSourceProps, applySettingsToAll(id), dispatch)(props)
	])

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
	multipleItems: bool.isRequired,
	sourceName: string.isRequired,
	sourcePrefix: bool.isRequired,
	sourceOnTop: bool.isRequired,
	background: oneOf(['blue', 'grey', 'light_blue', 'dark_blue', 'teal', 'tan', 'alpha', 'color']).isRequired,
	copyToClipboard: func.isRequired,
	dispatch: func.isRequired
}

Source.propTypes = propTypes
SourcePanel.propTypes = propTypes

export default SourcePanel
