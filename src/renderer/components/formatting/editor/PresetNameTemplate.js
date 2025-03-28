import React, { memo, useMemo } from 'react'
import { bool, func, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes
} from 'actions'

import { createObjectPicker, objectsAreEqual } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import TextInputWithTokenInsertion from '../../form_elements/TextInputWithTokenInsertion'

const extractPresetNameProps = createObjectPicker(['presetNamePrepend', 'presetNameAppend'])

const PresetNameTemplate = memo(({ presetNamePrepend, presetNameAppend, updateSelectionFromEvent }) => (
	<>
		<TextInputWithTokenInsertion
			label="Prepend to Filename"
			name="presetNamePrepend"
			value={presetNamePrepend}
			maxLength={251}
			placeholder="If none, leave blank"
			onChange={updateSelectionFromEvent}
			submenuAlignment="left top" />
		<TextInputWithTokenInsertion
			label="Append to Filename"
			name="presetNameAppend"
			value={presetNameAppend}
			maxLength={251}
			placeholder="If none, leave blank"
			onChange={updateSelectionFromEvent}
			submenuAlignment="left top" />
	</>
), objectsAreEqual)

const PresetNameTemplatePanel = ({ id, multipleItems, multipleItemsSelected, dispatch, ...rest }) => {
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
			<PresetNameTemplate {...rest} />
		</AccordionPanel>
	)
}

const sharedPropTypes = {
	presetNamePrepend: string,
	presetNameAppend: string,
	updateSelectionFromEvent: func.isRequired
}

PresetNameTemplatePanel.propTypes = {
	...sharedPropTypes,
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	dispatch: func.isRequired
}

PresetNameTemplate.propTypes = sharedPropTypes

export default PresetNameTemplatePanel
