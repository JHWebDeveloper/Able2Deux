import React, { createContext, useState } from 'react'

export const DraggingContext = createContext()

export const DraggingProvider = ({ children }) => {
	const [ dragOrigin , setDragOrigin ] = useState('')

	return (
		<DraggingContext.Provider value={{ dragOrigin, setDragOrigin }}>
			{children}
		</DraggingContext.Provider>
	)
}
