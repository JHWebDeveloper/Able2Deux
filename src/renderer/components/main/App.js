import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'css/index/index.css'

import { MainProvider, PanelsProvider } from 'store'

import Header from './Header'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'
import SourceSuggestionList from './SourceSuggestionList'
import GlobalListeners from './GlobalListeners'

const App = () => (
	<>
		<Header />
		<main>
			<MainProvider>
				<PanelsProvider>
					<HashRouter>
						<GlobalListeners />
						<Routes>
							<Route path="/" element={<Acquisition />}/>
							<Route path="/formatting" element={<Formatting />}/>
						</Routes>
					</HashRouter>
				</PanelsProvider>
			</MainProvider>
		</main>
		<SourceSuggestionList />
	</>
)

export default App
