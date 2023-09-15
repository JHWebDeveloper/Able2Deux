import React, { useCallback, useId } from 'react'
import { arrayOf, bool, exact, func, number, oneOfType, string } from 'prop-types'

import Checkbox from '../form_elements/Checkbox'

const SelectAttributes = ({ presets, updateState }) => {
  const presetKey = useId()

  const toggleIncludePreset = useCallback(e => {
		updateState(currentState => ({
			...currentState,
			presets: currentState.presets.map(item => item.attribute === e.target.name ? {
				...item,
				include: !item.include
			} : item)
		}))
	}, [])

  return (
    <fieldset className="radio-set">
      <legend>Select attributes to include:</legend>
      {presets.map(({ label, include, attribute }, i) => (
        <Checkbox
          key={`${presetKey}_${i}`}
          label={label}
          checked={include}
          name={attribute}
          onChange={toggleIncludePreset} />
      ))}
    </fieldset>
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