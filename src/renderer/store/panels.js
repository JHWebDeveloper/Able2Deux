import React, { createContext } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

import { panelsReducer as reducer } from 'reducer'
import { useAugmentedDispatch } from 'hooks'

const initState = {
	batchName: {
		open: false
	},
	preview: {
		open: true
	},
	fileOptions: {
		open: true
	},
	audio: {
		open: false
	},
	framing: {
		open: true
	},
	source: {
		open: true
	},
	centering: {
		open: true
	},
	position: {
		open: false
	},
	scale: {
		open: false
	},
	crop: {
		open: false
	},
	rotation: {
		open: false
	},
	keying: {
		open: false
	},
	colorCorrection: {
		open: false
	},
	presetNameTemplate: {
		open: false
	}
}

export const PanelsContext = createContext()

export const PanelsProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)

	return (
		<PanelsContext.Provider value={{
			...state,
			dispatch
		}}>
			{ children }
		</PanelsContext.Provider>
	)
}

PanelsProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
