import React, { useCallback } from 'react'
import { arrayOf, bool, exact, func, number, oneOfType, string } from 'prop-types'

import CheckboxGroup from '../form_elements/CheckboxGroup'

const SelectAttributes = ({ presets, updateState }) => {
  const toggleIncludePreset = useCallback((e, checked) => {
    const { name } = e?.target || e

		updateState(currentState => ({
			...currentState,
			presets: currentState.presets.map(item => item.attribute === name ? {
				...item,
				include: checked ?? !item.include
			} : item)
		}))
	}, [])

  return (
    <CheckboxGroup
      label="Select attributes to include"
      onChange={toggleIncludePreset} 
      checkboxes={presets.map(({ label, include, attribute }) => ({
        label,
        name: attribute,
        checked: include
      }))} />
  )
}

SelectAttributes.propTypes = {
  presets: arrayOf(exact({
    attribute: string,
    label: string,
    include: bool,
    order: number,
    value: oneOfType([bool, number, string, arrayOf(exact({
      id: string,
      hidden: bool,
      limit: bool,
      x: number,
      y: number
    }))])
  })),
  updateState: func.isRequired
}

export default SelectAttributes