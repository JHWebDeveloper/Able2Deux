import React, { useContext } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'css/index/index.css'

import {
	MainContext,
	MainProvider,
	PrefsContext,
	PrefsProvider,
	WorkspaceProvider
} from 'store'

import { usePreloadFont } from 'hooks'
import { CANVAS_FONTS } from 'constants'

import Header from './Header'
import MainForm from '../form_elements/MainForm'
import SourceSuggestionList from './SourceSuggestionList'
import GlobalListeners from './GlobalListeners'
import UndoRedoListener from './UndoRedoListener'
import WelcomeMessage from './WelcomeMessage'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'

const Router = () => {
	const { dispatch } = useContext(MainContext)
	const { preferences: { scratchDisk }, prefsLoaded } = useContext(PrefsContext)
	const [ fontsLoaded ] = usePreloadFont(CANVAS_FONTS)

	return prefsLoaded && fontsLoaded ? (
		<HashRouter>
			<GlobalListeners scratchDisk={scratchDisk} />
			<UndoRedoListener
				clearOnRouteChange
				dispatch={dispatch} />
			<WelcomeMessage />
			<Routes>
				<Route path="/" element={<Acquisition />}/>
				<Route path="/formatting" element={<Formatting />}/>
			</Routes>
		</HashRouter>
	) : <></>
}

const App = () => (
	<>
		<Header />
		<MainForm>
			<PrefsProvider enableSync>
				<MainProvider>
					<WorkspaceProvider>
						<Router />
					</WorkspaceProvider>
				</MainProvider>
			</PrefsProvider>
		</MainForm>
		<SourceSuggestionList />
	</>
)

export default App
