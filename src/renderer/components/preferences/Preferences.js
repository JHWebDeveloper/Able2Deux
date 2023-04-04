import React, { useContext, useEffect } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'
import 'css/preferences.css'

import { PrefsProvider, PrefsContext } from 'store'
import { updateState } from 'actions'
import { createKonamiListener, toastrOpts } from 'utilities'

import GeneralSettings from './GeneralSettings'
import AcquisitionSettings from './AcquisitionSettings'
import FormattingSettings from './FormattingSettings'
import PreviewSettings from './PreviewSettings'
import Rendering from './RenderOutput'
import SaveLocations from './SaveLocations'
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
				<NavLink to="/" title="General">General</NavLink>
				<NavLink to="/acquisition" title="Acquisition">Acquisition</NavLink>
				<NavLink to="/formatting" title="Formatting">Formatting</NavLink>
				<NavLink to="/preview" title="Preview">Preview</NavLink>
				<NavLink to="/rendering" title="Rendering">Rendering</NavLink>
				<NavLink to="/save-locations" title="Save Locations">Save Locations</NavLink>
			</nav>
			<Routes>
				<Route path="/" element={<GeneralSettings />} />
				<Route path="/acquisition" element={<AcquisitionSettings />} />
				<Route path="/formatting" element={<FormattingSettings />} />
				<Route path="/preview" element={<PreviewSettings />} />
				<Route path="/rendering" element={<Rendering />} />
				<Route path="/save-locations" element={<SaveLocations />} />
			</Routes>
			<SaveAndClose dispatch={dispatch} />
		</HashRouter> 
	)
}

const Preferences = () => (
	<PrefsProvider>
		<PreferencesRouter />
	</PrefsProvider>
)

export default Preferences
