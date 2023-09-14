import React, { memo, useCallback, useMemo } from 'react'

import { updateMediaStateBySelectionFromEvent } from 'actions'
import { createObjectPicker, objectsAreEqual } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'

const extractPresetNameProps = createObjectPicker(['presetNamePrepend', 'presetNameAppend'])

const PresetNameTemplate = memo(({ presetNamePrepend, presetNameAppend, dispatch }) => {
  const updatePresetName = useCallback(e => {
    dispatch(updateMediaStateBySelectionFromEvent(e))
  }, [])

  return (
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
          onChange={updatePresetName} />
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
          onChange={updatePresetName} />
			</fieldset>
    </>
  )
}, objectsAreEqual)

const PresetNameTemplatePanel = props => {
  const { multipleItems, multipleItemsSelected, id } = props

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

export default PresetNameTemplatePanel
