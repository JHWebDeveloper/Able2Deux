import React, { useContext } from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import 'css/index/index.css'

import { PrefsProvider, PrefsContext } from 'store/preferences'
import { MainProvider } from 'store'

import Header from './Header'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'
import SourceSuggestionList from './SourceSuggestionList'

const Main = () => {
	const { saveLocations, editAll } = useContext(PrefsContext).preferences

	return (
		<main>
			<MainProvider prefs={{ saveLocations, editAll }}>
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
