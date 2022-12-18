import React, { useEffect, useMemo, useState } from 'react'
import { bool, func, string } from 'prop-types'

import { debounce } from 'utilities'

const ColorInput = ({ name, value, title, onChange, onFocus, disabled }) => {
	const [ color, setColor ] = useState(value)

	const onChangeDebounce = useMemo(() => debounce(onChange, 60), [onChange])

	useEffect(() => {
		onChangeDebounce({ name, value: color })
	}, [color])

	return (
		<input
			type="color"
      name={name}
			value={value}
      title={title}
			onChange={e => setColor(e.target.value)}
			onFocus={onFocus}
      disabled={disabled} />
	)
}

ColorInput.propTypes = {
  name: string,
  value: string.isRequired,
  title: string,
  onChange: func.isRequired,
  onFocus: func,
  disabled: bool
}

export default ColorInput
