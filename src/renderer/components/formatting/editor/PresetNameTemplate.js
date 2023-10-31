import React, { memo, useMemo } from 'react'
import { bool, func, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes
} from 'actions'

import { createObjectPicker, objectsAreEqual } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import FieldsetWrapper from '../../form_elements/FieldsetWrapper'

const extractPresetNameProps = createObjectPicker(['presetNamePrepend', 'presetNameAppend'])

const PresetNameTemplate = memo(({ presetNamePrepend, presetNameAppend, updateSelectionFromEvent }) => (
	<>
		<FieldsetWrapper label="Prepend to Filename">
			<input
				type="text"
				name="presetNamePrepend"
				className="panel-input"
				title="Prepend to Filename"
				aria-label="Prepend to Filename"
				placeholder="If none, leave blank"
				value={presetNamePrepend}
				maxLength={251}
				onChange={updateSelectionFromEvent} />
		</FieldsetWrapper>
		<FieldsetWrapper label="Append to Filename">
			<input
				type="text"
				name="presetNameAppend"
				className="panel-input"
				title="Append to Filename"
				aria-label="Append to Filename"
				placeholder="If none, leave blank"
				value={presetNameAppend}
				maxLength={251}
				onChange={updateSelectionFromEvent} />
		</FieldsetWrapper>
	</>
), objectsAreEqual)

const PresetNameTemplatePanel = props => {
	const { multipleItems, multipleItemsSelected, id, dispatch } = props

	const settingsMenu = useMemo(() => multipleItems ? [
		{
			type: 'button',
			label: 'Copy Attributes',
			action() {
				dispatch(copyAttributes(id, extractPresetNameProps))
			}
		},
		{
			type: 'button',
			label: 'Apply to Selection',
			hide: !multipleItemsSelected,
			action() {
				dispatch(applyToSelection(id, extractPresetNameProps))
			}
		},
		{
			type: 'button',
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
			options={settingsMenu}>
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
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

PresetNameTemplate.propTypes = propTypes
PresetNameTemplatePanel.propTypes = propTypes

export default PresetNameTemplatePanel
