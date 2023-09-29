import React, { useContext, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'css/index/index.css'

import { 
	MainContext,
	MainProvider,
	PanelsProvider,
	PrefsContext,
	PrefsProvider
} from 'store'

import { updateState } from 'actions'
import { createObjectPicker, pipe } from 'utilities'

import Header from './Header'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'
import SourceSuggestionList from './SourceSuggestionList'
import GlobalListeners from './GlobalListeners'

const extractDefaultPrefs = createObjectPicker([
	'saveLocations',
	'split',
	'optimize',
	'timerEnabled',
	'timer',
	'screenshot',
	'previewQuality',
	'previewHeight',
	'aspectRatioMarkers'
])

const Router = () => {
	const { preferences } = useContext(PrefsContext)
	const { dispatch } = useContext(MainContext)

	useEffect(() => {
		pipe(extractDefaultPrefs, updateState, dispatch)(preferences)
	}, [preferences])
	
	return (
		<HashRouter>
			<GlobalListeners />
			<Routes>
				<Route path="/" element={<Acquisition />}/>
				<Route path="/formatting" element={<Formatting />}/>
			</Routes>
		</HashRouter>
	)
}

const App = () => (
	<>
		<PrefsProvider enableSync>
			<Header />
			<main>
				<MainProvider>
					<PanelsProvider>
						<Router />
					</PanelsProvider>
				</MainProvider>
			</main>
		</PrefsProvider>
		<SourceSuggestionList />
	</>
)

export default App
