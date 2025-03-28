import React, { useEffect, useMemo, useRef, useState } from 'react'
import { bool, func, string } from 'prop-types'

import { debounce } from 'utilities'

const ColorInput = ({ name, value, title, onChange, onFocus, disabled, ariaLabelledby }) => {
	const [ color, setColor ] = useState(value)
	const firstMount = useRef(true)

	const onChangeDebounce = useMemo(() => debounce(onChange, 60), [onChange])

	useEffect(() => {
		if (firstMount.current) {
			firstMount.current = false
		} else {			
			onChangeDebounce({ name, value: color })
		}
	}, [color])

	return (
		<input
			type="color"
			name={name}
			value={value}
			onChange={e => setColor(e.target.value)}
			onFocus={onFocus}
			disabled={disabled}
			{...title ? { title } : {}}
			{...ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : title ? { 'aria-label': title } : {}} />
	)
}

ColorInput.propTypes = {
	name: string,
	value: string.isRequired,
	title: string,
	onChange: func.isRequired,
	onFocus: func,
	disabled: bool,
	ariaLabelledby: string
}

export default ColorInput
