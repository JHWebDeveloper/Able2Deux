import React, { createContext, useContext, useEffect } from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'
import toastr from 'toastr'

import { renderQueueReducer as reducer } from 'reducer'
import { PrefsContext } from 'store'
import { prepareMediaForRender } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { useAugmentedDispatch } from 'hooks'

const { interop } = window.ABLE2

const initState = {
	media: [],
	directories: [],
	mediaLoaded: false
}

export const RenderQueueContext = createContext()

export const RenderQueueProvider = ({ children }) => {
	const [ state, dispatch ] = useAugmentedDispatch(reducer, initState)
	
	const {
		preferences: {
			asperaSafe,
			batchNameSeparator,
			casing,
			convertCase,
			dateTimeSource,
			replaceSpaces,
			spaceReplacement
		},
		prefsLoaded
	} = useContext(PrefsContext)

	useEffect(() => {
		if (!prefsLoaded) return

		(async () => {
			try {
				const { media, batchName, directories } = await interop.getMediaToRender()

				dispatch(prepareMediaForRender({
					media,
					batchName, 
					directories,
					asperaSafe,
					batchNameSeparator,
					casing,
					convertCase,
					dateTimeSource,
					replaceSpaces,
					spaceReplacement
				}))
			} catch (err) {
				toastr.error(err, false, TOASTR_OPTIONS)
			}
		})()
	}, [prefsLoaded])

	return (
		<RenderQueueContext.Provider value={{
			...state,
			dispatch
		}}>
			{ children }
		</RenderQueueContext.Provider>
	)
}

RenderQueueProvider.propTypes = {
	children: oneOfType([element, arrayOf(element)]).isRequired
}
