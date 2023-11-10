import React, { useContext, useEffect, useRef } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'
import 'css/preferences.css'

import { PrefsProvider, PrefsContext } from 'store'
import { updateState } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { createKonamiListener } from 'utilities'

import MainForm from '../form_elements/MainForm'
import GeneralSettings from './GeneralSettings'
import AcquisitionSettings from './AcquisitionSettings'
import FormattingSettings from './FormattingSettings'
import PreviewSettings from './PreviewSettings'
import Rendering from './RenderOutput'
import SaveLocations from './SaveLocations'
import SaveAndClose from './SaveAndClose'

const Preferences = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { disableRateLimit } = preferences
	const konami = useRef(createKonamiListener())

	useEffect(() => {
		konami.current.listen(() => {
			dispatch(updateState({
				disableRateLimit: !disableRateLimit
			}))
			
			toastr.success(
				`Download Rate Limit is now ${disableRateLimit ? 'Dis' : 'En'}abled`,
				'You entered the Konami Code!',
				{ ...TOASTR_OPTIONS, timeOut: 2000 })
		})

		return () => {
			konami.current.remove()
		}
	}, [disableRateLimit])

	return (
		<>
			<MainForm>
				<section className="tabbed-nav">
					<HashRouter>
						<nav>
							<NavLink to="/" title="General">General</NavLink>
							<NavLink to="/acquisition" title="Acquisition">Acquisition</NavLink>
							<NavLink to="/formatting" title="Formatting">Formatting</NavLink>
							<NavLink to="/preview" title="Preview">Preview</NavLink>
							<NavLink to="/rendering" title="Rendering">Rendering</NavLink>
							<NavLink to="/save-locations" title="Save Locations">Save Locations</NavLink>
						</nav>
						<div>
							<div className="nav-panel-grid">
								<Routes>
									<Route path="/" element={<GeneralSettings />} />
									<Route path="/acquisition" element={<AcquisitionSettings />} />
									<Route path="/formatting" element={<FormattingSettings />} />
									<Route path="/preview" element={<PreviewSettings />} />
									<Route path="/rendering" element={<Rendering />} />
									<Route path="/save-locations" element={<SaveLocations />} />
								</Routes>
							</div>
						</div>
					</HashRouter>
				</section>
			</MainForm> 
			<SaveAndClose dispatch={dispatch} />
		</>
	)
}

export default () => (
	<PrefsProvider>
		<Preferences />
	</PrefsProvider>
)
