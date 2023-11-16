import React, { useCallback, useContext, useEffect } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'

import 'css/preset_save_as.css'

import {
	PresetsProvider,
	PresetsContext,
	PresetSaveAsProvider,
	PresetSaveAsContext
} from 'store'

import { togglePresetLimitTo, updatePresetStateBySelection, updateState } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { errorToString, createPresetFromAttributeSet, omitFromHistory, pipe } from 'utilities'

import MainForm from '../form_elements/MainForm'
import UndoRedoListener from '../main/UndoRedoListener'
import RadioSet from '../form_elements/RadioSet'
import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import SelectInput from '../form_elements/SelectInput'
import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import AttributeSelector from './AttributeSelector'
import PresetOptions from './PresetOptions'

const { interop } = window.ABLE2

const SAVE_TYPE_OPTIONS = Object.freeze([
	{
		label: 'New Preset',
		value: 'newPreset'
	},
	{
		label: 'Replace Existing Preset',
		value: 'replace'
	},
	{
		label: 'Merge with Existing Preset',
		value: 'merge'
	}
])

const PresetSaveAs = () => {
	const { presets: existingPresets = [] } = useContext(PresetsContext).presets
	const { saveType, selectedPreset, presets: [ newPreset = {} ], dispatch } = useContext(PresetSaveAsContext)

	const {
		label = '',
		attributes = [],
		presetNamePrepend = '',
		presetNameAppend = '',
		limitTo = []
	} = newPreset

	const saveEnabled = (saveType === 'newPreset' && label.length || saveType !== 'newPreset' && selectedPreset) && attributes.some(({ include }) => include) && limitTo.length

	const updateStateFromEvent = useCallback(e => {
		dispatch(updateState({
			[e.target.name]: e.target.value
		}))
	}, [])

	const updatePresetStateFromEvent = useCallback(e => {
		dispatch(updatePresetStateBySelection({
			[e.target.name]: e.target.value
		}))
	}, [])

	const togglePresetLimitToFromEvent = useCallback(e => {
		dispatch(togglePresetLimitTo(e.target.name))
	}, [])

	const savePreset = async () => {
		try {
			await interop.savePreset(createPresetFromAttributeSet({
				presetNamePrepend,
				presetNameAppend,
				attributes,
				...saveType === 'newPreset' ? {
					label
				} : {
					id: selectedPreset
				},
				...saveType === 'merge' ? {} : {
					limitTo
				}
			}), saveType)
	
			interop.closePresetSaveAs()
		} catch (err) {
			toastr.error(errorToString(err), false, TOASTR_OPTIONS)
		}
	}

	useEffect(() => {
		if (saveType !== 'newPreset' && !selectedPreset) {
			pipe(updateState, omitFromHistory, dispatch)({
				selectedPreset: existingPresets[0].id
			})
		}
	}, [saveType, existingPresets])

	return (
		<>
			<UndoRedoListener dispatch={dispatch} />
			<header>
				<h1>Save Preset</h1>
			</header>
			<MainForm>
				<section className="preset-name">
					{existingPresets.length ? (
						<RadioSet
							label="Save Type"
							name="saveType"
							state={saveType}
							onChange={updateStateFromEvent}
							options={SAVE_TYPE_OPTIONS}/>
					) : <></>}
					{saveType === 'newPreset' ? (
						<FieldsetWrapper label="Preset Name">
							<input
								type="text"
								className="panel-input"
								name="label"
								maxLength={50}
								value={label}
								onChange={updatePresetStateFromEvent} />
						</FieldsetWrapper>
					) : (
						<FieldsetWrapper label="Select Preset">
							<SelectInput
								name="selectedPreset"
								value={selectedPreset}
								onChange={updateStateFromEvent}
								options={existingPresets} />
						</FieldsetWrapper>
					)}
				</section>
				<section className="tabbed-nav rounded-tabs no-rounded-edges">
					<HashRouter>
						<nav>
							<NavLink to="/" title="Attributes">Attributes</NavLink>
							<NavLink to="/options" title="Options">Options</NavLink>
						</nav>
						<div>
							<div>
								<Routes>
									<Route path="/" element={
										<AttributeSelector
											attributes={attributes}
											dispatch={dispatch} />
									} />
									<Route path="/options" element={
										<PresetOptions
											presetNamePrepend={presetNamePrepend}
											presetNameAppend={presetNameAppend}
											limitTo={limitTo}
											updatePresetState={updatePresetStateFromEvent}
											toggleLimitTo={togglePresetLimitToFromEvent}
											hideLimitTo={saveType === 'merge'} />
									} />
								</Routes>
							</div>
						</div>
					</HashRouter>
				</section>
			</MainForm>
			<footer>
				<ButtonWithIcon
					label="Save"
					icon="save"
					title="Save Preset"
					onClick={savePreset}
					disabled={!saveEnabled} />
				<ButtonWithIcon
					label="Cancel"
					icon="close"
					title="Cancel Preset"
					onClick={interop.closePresetSaveAs} />
			</footer>
		</>
	)
}

export default () => (
	<PresetsProvider referencesOnly presorted>
		<PresetSaveAsProvider>
			<PresetSaveAs />
		</PresetSaveAsProvider>
	</PresetsProvider>
)
