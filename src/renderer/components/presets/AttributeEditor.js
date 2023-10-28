import React, { useCallback } from 'react'

import {
  toggleIncludePresetAttribute,
  toggleAllPresetAttributes,
  togglePresetAttribute,
  updatePresetAttribute
} from 'actions'

import CheckboxSet from '../form_elements/CheckboxSet'
import SelectInput from '../form_elements/SelectInput'
import NumberInput from '../form_elements/NumberInput'
import Checkbox from '../form_elements/Checkbox'
import ColorInput from '../form_elements/ColorInput'

const AttributeInput = props => {
  const { inputType, attribute, value, onChange, disabled, constraints } = props

  const commonAttributes = {
    name: attribute,
    value,
    onChange,
    disabled
  }

  if (Array.isArray(inputType)) {
    return (
      <SelectInput
        options={inputType}
        {...commonAttributes} />
    )
  }

  switch (inputType) {
    case 'number':
      return (
        <NumberInput
          {...commonAttributes}
          {...constraints} />
      )
    case 'boolean':
      return (
        <Checkbox
          name={attribute}
          checked={value}
          onChange={props.onChangeToggle}
          disabled={disabled} />
      )
    case 'color':
      return <ColorInput {...commonAttributes} />
    case 'text':
      return (
        <input
          type="text"
          className="panel-input"
          {...commonAttributes}
          {...constraints} />
      )
    default:
      return <></>
  }
}

const AttributeEditor = ({ attributes = [], dispatch }) => {
  const dispatchToggleAllPresetAttributes = useCallback(e => {
    const { checked } = e?.target || e
    dispatch(toggleAllPresetAttributes(checked))
  }, [])

  const dispatchToggleIncludePresetAttribute = useCallback(e => {
    const { name } = e?.target || e
    dispatch(toggleIncludePresetAttribute(name))
  }, [])

  const dispatchTogglePresetAttribute = useCallback(e => {
    const { name } = e?.target || e
    dispatch(togglePresetAttribute(name))
  }, [])

  const dispatchUpdatePresetAttribute = useCallback(e => {
    const { name, value } = e?.target || e
    dispatch(updatePresetAttribute(name, value))
  }, [])
  
  return (
    <div className="nav-panel-grid">
      <CheckboxSet
        label="Select and Set Preset Attributes"
        selectAllLabel="Enable All"
        hideLabel
        switchIcon
        onChange={dispatchToggleIncludePresetAttribute}
        toggleSelectAll={dispatchToggleAllPresetAttributes}
        checkboxes={attributes.map(item => ({
          label: item.label,
          name: item.attribute,
          checked: item.include,
          component: (
            <AttributeInput
              onChange={dispatchUpdatePresetAttribute}
              onChangeToggle={dispatchTogglePresetAttribute}
              disabled={!item.include}
              {...item} />
          )
        }))} />
    </div>
  )
}

export default AttributeEditor
