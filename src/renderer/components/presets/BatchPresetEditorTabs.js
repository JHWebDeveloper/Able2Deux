import React, { useState } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import { array, arrayOf, func, object, string } from 'prop-types'

import PresetBatch from './PresetBatch'
import AttributeEditor from './AttributeEditor'
import BatchPresetOptions from './BatchPresetOptions'

const BatchPresetEditorTabs = ({
	id,
	presetIds,
	label,
	attributes,
	presetOptions,
	updatePresetState,
	togglePresetState,
	toggleLimitTo,
	dispatch
}) => {
	const [ focusedIndex, setFocusedIndex ] = useState(0)

	return (
		<div className="tabbed-nav rounded-tabs">
			<HashRouter>
				<nav>
					<NavLink to="/" title="Presets">Presets</NavLink>
					<NavLink to="/attributes" title="Attributes">Attributes</NavLink>
					<NavLink to="/options" title="Advanced Options">Advanced</NavLink>
				</nav>
				<div>
					<Routes>
						<Route path="/" element={
							<PresetBatch
								id={id}
								focusedIndex={focusedIndex}
								setFocusedIndex={setFocusedIndex}
								presetIds={presetIds}
								label={label}
								dispatch={dispatch} />
						} />
						<Route path="/attributes" element={
							<AttributeEditor
								attributes={attributes}
								dispatch={dispatch} />
						} />
						<Route path="/options" element={
							<BatchPresetOptions
								updatePresetState={updatePresetState}
								togglePresetState={togglePresetState}
								toggleLimitTo={toggleLimitTo}
								{...presetOptions} />
						} />
					</Routes>
				</div>
			</HashRouter>
		</div>
	)
}

BatchPresetEditorTabs.propTypes = {
	id: string,
	presetIds: arrayOf(string),
	label: string,
	attributes: array,
	presetOptions: object,
	updatePresetState: func.isRequired,
	togglePresetState: func.isRequired,
	toggleLimitTo: func.isRequired,
	dispatch: func.isRequired
}

export default BatchPresetEditorTabs
