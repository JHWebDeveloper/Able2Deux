import React, { memo, useMemo } from 'react'
import { bool, func, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes
} from 'actions'

import { createObjectPicker, objectsAreEqual } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'

const extractPresetNameProps = createObjectPicker(['presetNamePrepend', 'presetNameAppend'])

const PresetNameTemplate = memo(({ presetNamePrepend, presetNameAppend, updateSelectionFromEvent }) => (
	<>
		<fieldset>
			<legend>Prepend to Filename<span aria-hidden>:</span></legend>
			<input
				type="text"
				name="presetNamePrepend"
				title="Prepend to Filename"
				aria-label="Prepend to Filename"
				className="underline"
				placeholder="If none, leave blank"
				value={presetNamePrepend}
				maxLength={251}
				onChange={updateSelectionFromEvent} />
		</fieldset>
		<fieldset>
			<legend>Append to Filename<span aria-hidden>:</span></legend>
			<input
				type="text"
				name="presetNameAppend"
				title="Append to Filename"
				aria-label="Append to Filename"
				className="underline"
				placeholder="If none, leave blank"
				value={presetNameAppend}
				maxLength={251}
				onChange={updateSelectionFromEvent} />
		</fieldset>
	</>
), objectsAreEqual)

const PresetNameTemplatePanel = props => {
	const { multipleItems, multipleItemsSelected, id, dispatch } = props

	const settingsMenu = useMemo(() => multipleItems ? [
		{
			label: 'Copy Attributes',
			action() {
				dispatch(copyAttributes(id, extractPresetNameProps))
			}
		},
		{
			label: 'Apply to Selection',
			hide: !multipleItemsSelected,
			action() {
				dispatch(applyToSelection(id, extractPresetNameProps))
			}
		},
		{
			label: 'Apply to All',
			hide: multipleItemsSelected,
			action() {
				dispatch(applyToAll(id, extractPresetNameProps))
			}
		}
	] : [], [multipleItems, multipleItemsSelected, id])

	return (
		<AccordionPanel
			heading="Preset Name Template"
			id="presetNameTemplate"
			className="editor-options auto-rows"
			buttons={settingsMenu}>
			<PresetNameTemplate {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	presetNamePrepend: string,
	presetNameAppend: string,
	updateSelectionFromEvent: func.isRequired
}

PresetNameTemplate.propTypes = propTypes
PresetNameTemplatePanel.propTypes = { ...propTypes, dispatch: func.isRequired }

export default PresetNameTemplatePanel
