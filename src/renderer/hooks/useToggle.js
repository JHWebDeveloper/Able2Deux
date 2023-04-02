import { useState } from 'react'

export const useToggle = (initState = false) => {
  const [ value, setValue ] = useState(initState)

  const toggleValue = newValue => {
    setValue(currentValue => (
      typeof newValue === 'boolean' ? newValue : !currentValue
    ))
  }

  return [ value, toggleValue ]
}
