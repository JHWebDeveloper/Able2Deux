import React, { createContext } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { importQueueReducer as reducer } from 'reducer'
import { useAugmentedDispatch } from 'hooks'

const initState = {
  media: []
}

export const ImportQueueContext = createContext()

export const ImportQueueProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	return (
		<ImportQueueContext.Provider value={{
			...state,
			dispatch
		}}>
			{children}
		</ImportQueueContext.Provider>
	)
}

ImportQueueProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
