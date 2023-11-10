import React, { useContext } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'css/index/index.css'

import { 
	MainProvider,
	PanelsProvider,
	PrefsContext,
	PrefsProvider
} from 'store'

import Header from './Header'
import MainForm from '../form_elements/MainForm'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'
import SourceSuggestionList from './SourceSuggestionList'
import GlobalListeners from './GlobalListeners'

const Router = () => {
	const { preferences: { scratchDisk }, prefsLoaded } = useContext(PrefsContext)

	return prefsLoaded ? (
		<HashRouter>
			<GlobalListeners scratchDisk={scratchDisk} />
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
					<PanelsProvider>
						<Router />
					</PanelsProvider>
				</MainProvider>
			</PrefsProvider>
		</MainForm>
		<SourceSuggestionList />
	</>
)

export default App
