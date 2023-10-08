import React from 'react'
import { arrayOf, bool, exact, func, string } from 'prop-types'

const SelectInput = ({ name, value, onChange, disabled, options, title, ariaLabelledby }) => (
  <select
    className="panel-input"
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    {...title ? { title } : {}}
    {...ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : title ? { 'aria-label': title } : {}}>
    {options.map(opt => <option value={opt.value}>{opt.label}</option>)}
  </select>
)

SelectInput.propTypes = {
  name: string.isRequired,
  value: string.isRequired,
  onChange: func.isRequired,
  disabled: bool,
  options: arrayOf(exact({
    label: string,
    value: string
  })).isRequired,
  title: string,
  ariaLabelledby: string
}

export default SelectInput
