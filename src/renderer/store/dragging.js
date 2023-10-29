import React, { createContext, useState } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

export const DraggingContext = createContext()

export const DraggingProvider = ({ children }) => {
	const [ dragOrigin, setDragOrigin ] = useState('')

	return (
		<DraggingContext.Provider value={{ dragOrigin, setDragOrigin }}>
			{children}
		</DraggingContext.Provider>
	)
}

DraggingProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
