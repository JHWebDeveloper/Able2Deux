import React, { useContext, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'css/index/index.css'

import { PrefsProvider, PrefsContext } from 'store/preferences'
import { MainProvider } from 'store'
import { debounce, objectExtract } from 'utilities'

import Header from './Header'
import Acquisition from '../acquisition/Acquisition'
import Formatting from '../formatting/Formatting'
import SourceSuggestionList from './SourceSuggestionList'
import FileOpenListener from './FileOpenListener'

const { interop } = window.ABLE2

const extractDefaults = (() => {
	const defaults = ['saveLocations', 'editAll', 'split', 'optimize', 'timerEnabled', 'timer', 'screenshot', 'previewQuality', 'aspectRatioMarkers']

	return obj => objectExtract(obj, defaults)
})()

const saveWindowSize = debounce(() => {
	interop.saveWindowSize(window.outerWidth, window.outerHeight)
}, 500)

const Main = () => {
	const { preferences } = useContext(PrefsContext)

	useEffect(() => {
		interop.addOpenImportCacheListener(preferences.scratchDisk.imports)
		window.addEventListener('resize', saveWindowSize)

		return () => {
			interop.removeOpenImportCacheListener()
			window.removeEventListener('resize', saveWindowSize)
		}
	}, [preferences.scratchDisk.imports])

	return (
		<main>
			<MainProvider prefs={extractDefaults(preferences)}>
				<HashRouter>
					<FileOpenListener />
					<Routes>
						<Route path="/" element={<Acquisition />}/>
						<Route path="/formatting" element={<Formatting />}/>
					</Routes>
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
