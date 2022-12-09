import React, { useContext, useEffect } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'
import 'css/preferences.css'

import { PrefsProvider, PrefsContext } from 'store/preferences'
import { updateState } from 'actions'
import { toastrOpts, createKonamiListener } from 'utilities'

import RenderOutput from './RenderOutput'
import AcquisitionSettings from './AcquisitionSettings'
import FormattingSettings from './FormattingSettings'
import Warnings from './Warnings'
import SaveAndClose from './SaveAndClose'

const konami = createKonamiListener()

const PreferencesRouter = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { disableRateLimit } = preferences

	useEffect(() => {
		konami.listen(() => {
			dispatch(updateState({
				disableRateLimit: !disableRateLimit
			}))

			toastr.success(
				`Download Rate Limit is now ${disableRateLimit ? 'En' : 'Dis'}abled`,
				'You entered the Konami Code!',
				{ ...toastrOpts, timeOut: 2000 })
		})

		return () => {
			konami.remove()
		}
	})

	return (
		<HashRouter>
			<nav>
				<NavLink to="/" title="Acquisition">Acquisition</NavLink>
				<NavLink to="/formatting" title="Formatting">Formatting</NavLink>
				<NavLink to="/renderoutput" title="Render Output">Render Output</NavLink>
				<NavLink to="/warnings" title="Warnings">Warnings</NavLink>
			</nav>
			<Routes>
				<Route path="/" element={<AcquisitionSettings />} />
				<Route path="/formatting" element={<FormattingSettings />} />
				<Route path="/renderoutput" element={<RenderOutput />} />
				<Route path="/warnings" element={<Warnings />} />
			</Routes>
			<SaveAndClose dispatch={dispatch} />
		</HashRouter> 
	)
}

			// <AcquisitionSettings
			// 	optimize={preferences.optimize}
			// 	screenshot={preferences.screenshot}
			// 	screenRecorderFrameRate={preferences.screenRecorderFrameRate}
			// 	timerEnabled={preferences.timerEnabled}
			// 	timer={preferences.timer}
			// 	dispatch={dispatch} />
			// <FormattingSettings
			// 	editAll={preferences.editAll}
			// 	sliderSnapPoints={preferences.sliderSnapPoints}
			// 	aspectRatioMarkers={preferences.aspectRatioMarkers}
			// 	gridColor={preferences.gridColor}
			// 	split={preferences.split}
			// 	animateBackground={preferences.animateBackground}
			// 	enable11pmBackgrounds={preferences.enable11pmBackgrounds}
			// 	scaleSliderMax={preferences.scaleSliderMax}
			// 	dispatch={dispatch} />
			// <Warnings
			// 	warnings={preferences.warnings}
			// 	dispatch={dispatch} />
			// <ScratchDisk 
			// 	scratchDisk={preferences.scratchDisk}
			// 	dispatch={dispatch} />
			// <RenderOutput
			// 	renderOutput={preferences.renderOutput}
			// 	renderFrameRate={preferences.renderFrameRate}
			// 	customFrameRate={preferences.customFrameRate}
			// 	autoPNG={preferences.autoPNG}
			// 	asperaSafe={preferences.asperaSafe}
			// 	concurrent={preferences.concurrent}
			// 	dispatch={dispatch} />
			// <SaveLocations
			// 	saveLocations={preferences.saveLocations}
			// 	dispatch={dispatch} />
			// <SaveAndClose dispatch={dispatch} /> 

const Preferences = () => (
	<PrefsProvider>
		<PreferencesRouter />
	</PrefsProvider>
)

export default Preferences
