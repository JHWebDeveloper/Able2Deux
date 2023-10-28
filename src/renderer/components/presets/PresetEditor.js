import React, { useCallback } from 'react'

import { togglePresetLimitTo, togglePresetState } from 'actions'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import Checkbox from '../form_elements/Checkbox'
import BatchPresetEditorTabs from './BatchPresetEditorTabs'
import PresetEditorTabs from './PresetEditorTabs'

const PresetEditor = ({ focused, updatePresetState, dispatch }) => {
  const togglePresetStateFromEvent = useCallback(e => {
    dispatch(togglePresetState(e.target.name))
  }, [])

  const toggleLimitToFromEvent = useCallback(e => {
    dispatch(togglePresetLimitTo(e.target.name))
  }, [])

  const { id, hidden, attributes, label, presetIds, ...presetOptions } = focused

  const commonProps = {
    toggleLimitTo: toggleLimitToFromEvent,
    updatePresetState,
    presetOptions,
    attributes,
    dispatch
  }

  return (
    <div className="preset-editor">
      <section className="preset-basic-options panel">
        <FieldsetWrapper label="Preset Name">
          <input
            type="text"
            name="label"
            className="panel-input"
            value={label ?? ''}
            onChange={updatePresetState} />
        </FieldsetWrapper>
        <Checkbox
          name="hidden"
          label="Show in Dropdown Menu"
          checked={!hidden}
          onChange={togglePresetStateFromEvent}
          switchIcon />
      </section>
      {focused.type === 'batchPreset' ? (
        <BatchPresetEditorTabs
          id={id}
          label={label}
          presetIds={presetIds}
          togglePresetState={togglePresetStateFromEvent}
          {...commonProps} />
      ) : (
        <PresetEditorTabs {...commonProps} />
      )}
    </div>
  )
}

export default PresetEditor
