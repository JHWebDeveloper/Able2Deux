import React, { useContext, useEffect } from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import 'css/index/index.css'

import { PrefsProvider, PrefsContext } from 'store/preferences'
import { MainProvider } from 'store'
import { objectExtract } from 'utilities'

import Header from './Header'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'
import SourceSuggestionList from './SourceSuggestionList'

const { interop } = window.ABLE2

const extractDefaults = (() => {
	const defaults = ['saveLocations', 'editAll', 'split', 'optimize', 'timerEnabled', 'timer', 'screenshot']

	return obj => objectExtract(obj, defaults)
})()

const Main = () => {
	const { preferences } = useContext(PrefsContext)

	useEffect(() => {
		interop.addOpenImportCacheListener(preferences.scratchDisk.imports)

		return interop.removeOpenImportCacheListener
	})

	return (
		<main>
			<MainProvider prefs={extractDefaults(preferences)}>
				<HashRouter>
					<Switch>
						<Route path="/" exact component={Acquisition}/>
						<Route path="/formatting" component={Formatting}/>
					</Switch>
				</HashRouter>
			</MainProvider>
		</main>
	)
}

const App = () => (
	<>
		<Header />
		<PrefsProvider>
			<Main />
		</PrefsProvider>
		<SourceSuggestionList />
	</>
)

export default App
