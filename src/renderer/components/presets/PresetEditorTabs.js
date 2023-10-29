import React from 'react'
import { HashRouter, Navigate, NavLink, Routes, Route } from 'react-router-dom'
import { array, func, object } from 'prop-types'

import AttributeEditor from './AttributeEditor'
import PresetOptions from './PresetOptions'

const PresetEditorTabs = ({
	attributes,
	presetOptions,
	updatePresetState,
	toggleLimitTo,
	dispatch
}) => (
	<div className="preset-tabs tabbed-nav rounded-tabs">
		<HashRouter>
			<nav>
				<NavLink to="/" title="Attributes">Attributes</NavLink>
				<NavLink to="/options" title="Advanced Options">Advanced</NavLink>
			</nav>
			<div>
				<Routes>
					<Route path="/" element={
						<AttributeEditor
							attributes={attributes}
							dispatch={dispatch} />
					} />
					<Route path="/options" element={
						<PresetOptions
							updatePresetState={updatePresetState}
							toggleLimitTo={toggleLimitTo}
							{...presetOptions} />
					} />
					<Route path="/attributes" element={<Navigate replace to="/" />}/>
				</Routes>
			</div>
		</HashRouter>
	</div>
)

PresetEditorTabs.propTypes = {
	attributes: array.isRequired,
	presetOptions: object.isRequired,
	updatePresetState: func.isRequired,
	toggleLimitTo: func.isRequired,
	dispatch: func.isRequired
}

export default PresetEditorTabs
