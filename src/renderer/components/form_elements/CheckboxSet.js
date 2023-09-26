import React, { useId, useMemo } from 'react'
import { arrayOf, bool, func, shape, string } from 'prop-types'

import FieldsetWrapper from './FieldsetWrapper'
import Checkbox from './Checkbox'

const SelectAllCheckbox = ({ checkboxes, toggleSelectAll }) => {
  const allSelected = useMemo(() => (
    checkboxes.every(({ checked }) => checked)
  ), [checkboxes])

  return (
    <Checkbox
      label="Select All"
      checked={allSelected}
      onChange={toggleSelectAll} />
  )
}

const CheckboxSet = ({
  label,
  hideLabel,
  disabled,
  checkboxes,
  onChange: onChangeFallback,
  toggleSelectAll,
  selectAllThreshold = 1
}) => {
  const setKey = useId()
  const offsetKey = toggleSelectAll ? 0 : 1

  return (
    <FieldsetWrapper
      label={label}
      className="radio-set"
      hideLabel={hideLabel}
      disabled={disabled}>
      <>
        {toggleSelectAll && checkboxes.length > selectAllThreshold ? (
          <SelectAllCheckbox
            key={`${setKey}_0`}
            checkboxes={checkboxes}
            toggleSelectAll={toggleSelectAll} />
        ) : <></>}
        {checkboxes.map(({ hidden, label, checked, name, onChange }, i) => {
          const key = `${setKey}_${i + offsetKey}`

          return hidden ? (
            <React.Fragment key={key}/>
          ) : (
            <Checkbox
              key={key}
              label={label}
              checked={checked}
              name={name}
              onChange={onChange || onChangeFallback} />
          )
        })}
      </>
    </FieldsetWrapper>
  )
}

const commonPropTypes = {
  checkboxes: arrayOf(shape({
    label: string,
    name: string,
    checked: bool,
    onChange: func
  })),
}

SelectAllCheckbox.propTypes = commonPropTypes

CheckboxSet.propTypes = {
  ...commonPropTypes,
  label: string.isRequired,
  onChange: func,
  toggleSelectAll: func
}

export default CheckboxSet
