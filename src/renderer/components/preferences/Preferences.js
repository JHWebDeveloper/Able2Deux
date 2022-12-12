import React, { useContext, useEffect } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'
import 'css/preferences.css'

import { PrefsProvider, PrefsContext } from 'store/preferences'
import { updateState } from 'actions'
import { toastrOpts, createKonamiListener } from 'utilities'

import Rendering from './RenderOutput'
import AcquisitionSettings from './AcquisitionSettings'
import PreviewSettings from './PreviewSettings'
import FormattingSettings from './FormattingSettings'
import SaveLocations from './SaveLocations'
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
				<NavLink to="/preview" title="Preview">Preview</NavLink>
				<NavLink to="/formatting" title="Formatting">Formatting</NavLink>
				<NavLink to="/rendering" title="Rendering">Rendering</NavLink>
				<NavLink to="/save-locations" title="Save Locations">Save Locations</NavLink>
				<NavLink to="/warnings" title="Warnings">Warnings</NavLink>
			</nav>
			<Routes>
				<Route path="/" element={<AcquisitionSettings />} />
				<Route path="/preview" element={<PreviewSettings />} />
				<Route path="/formatting" element={<FormattingSettings />} />
				<Route path="/rendering" element={<Rendering />} />
				<Route path="/save-locations" element={<SaveLocations />} />
				<Route path="/warnings" element={<Warnings />} />
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
