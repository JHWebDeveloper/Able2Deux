import React, { useCallback, useContext, useEffect, useState } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'
import '../../css/preset_save_as.css'

import { PresetsProvider, PresetsContext } from 'store'

import { MEDIA_TYPES, TOASTR_OPTIONS } from 'constants'

import {
	errorToString,
	createAttributesFromPresetAttributeProperty as createNewAttributesFromMediaState,
	pipe
} from 'utilities'

import MainForm from '../form_elements/MainForm'
import RadioSet from '../form_elements/RadioSet'
import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import AttributeSelector from './AttributeSelector'
import PresetOptions from './PresetOptions'

const { interop } = window.ABLE2

const SAVE_TYPE_BUTTONS = Object.freeze([
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

const removeOutterAttributes = attributes => attributes.filter(attr => attr.include)

const includeAttributesByMediaState = mediaState => attributes => attributes.map(attr => {
	switch (attr.attribute) {
		case 'overlay':
		case 'background':
			attr.include = mediaState.arc !== 'none'
			break
		case 'bgColor':
			attr.include = mediaState.arc !== 'none' && mediaState.background === 'color'
			break
		case 'backgroundMotion':
			attr.include = mediaState.arc !== 'none' && mediaState.background !== 'alpha' && mediaState.background !== 'color'
			break
		case 'sourceName':
		case 'sourcePrefix':
		case 'sourceOnTop':
			attr.include = !!mediaState.sourceName
			break
		case 'rotatedCentering':
			attr.include = mediaState.freeRotateMode === 'inside_bounds'
			break
		case 'keyingType':
		case 'keyingColor':
		case 'keyingSimilarity':
		case 'keyingBlend':
		case 'keyingThreshold':
		case 'keyingTolerance':
		case 'keyingSoftness':
			attr.include = mediaState.keyingEnabled
			break
		case 'ccRGB':
		case 'ccR':
		case 'ccG':
		case 'ccB':
			attr.include = mediaState.ccEnabled
			break
		default:
			attr.include = true
	}

	return attr
})

const mapPresetToAttributes = preset => preset.reduce((acc, { include, attribute, value }) => {
	if (include) acc[attribute] = value
	return acc
}, {})

const PresetSaveAs = () => {
	const { presets: existingPresets } = useContext(PresetsContext).presets

	const [ state, updateState ] = useState({
		saveType: 'newPreset',
		presetName: '',
		selectedPreset: '',
		attributes: [],
		presetNamePrepend: '',
		presetNameAppend: '',
		limitTo: [...MEDIA_TYPES]
	})

	const { saveType, presetName, selectedPreset, attributes, presetNamePrepend, presetNameAppend, limitTo } = state
	const saveEnabled = (saveType === 'newPreset' && presetName.length || selectedPreset) && attributes.some(({ include }) => include) && limitTo.length

	const updateStateFromEvent = useCallback(e => {
		updateState(currentState => ({
			...currentState,
			[e.target.name]: e.target.value
		}))
	}, [])

	const toggleLimitTo = useCallback(e => {
		const { name, checked } = e?.target || e

		updateState(currentState => ({
			...currentState,
			limitTo: !checked
				? currentState.limitTo.filter(mediaType => mediaType !== name)
				: [...currentState.limitTo, name].toSorted()
		}))
	}, [])

	const savePreset = async () => {
		try {
			await interop.savePreset({
				type: 'preset',
				limitTo,
				attributes: {
					...mapPresetToAttributes(attributes),
					...presetNamePrepend ? { presetNamePrepend } : {},
					...presetNameAppend ? { presetNameAppend } : {}
				},
				...saveType === 'newPreset' ? {
					label: presetName
				} : {
					id: selectedPreset,
					overwrite: saveType === 'replace'
				}
			})
	
			interop.closePresetSaveAs()
		} catch (err) {
			toastr.error(errorToString(err), false, TOASTR_OPTIONS)
		}
	}

	useEffect(() => {
		(async () => {
			let { presetNamePrepend, presetNameAppend, ...mediaState } = await interop.getPresetToSave()

			updateState(currentState => ({
				...currentState,
				attributes: pipe(
					createNewAttributesFromMediaState,
					removeOutterAttributes,
					includeAttributesByMediaState(mediaState)
				)(mediaState),
				presetNamePrepend: presetNamePrepend ?? '',
				presetNameAppend: presetNameAppend ?? ''
			}))
		})()
	}, [])

	useEffect(() => {
		if (saveType !== 'newPreset' && !selectedPreset) updateState(currentState => ({
			...currentState,
			selectedPreset: existingPresets[0].id
		}))
	}, [saveType, existingPresets])

	return (
		<>
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
							buttons={SAVE_TYPE_BUTTONS}/>
					) : <></>}
					{saveType === 'newPreset' ? (
						<FieldsetWrapper label="Preset Name">
							<input
								type="text"
								className="panel-input"
								name="presetName"
								maxLength={50}
								value={presetName}
								onChange={updateStateFromEvent} />
						</FieldsetWrapper>
					) : (
						<FieldsetWrapper label="Select Preset">
							<select
								className="panel-input"
								name="selectedPreset"
								value={selectedPreset}
								onChange={updateStateFromEvent}>
								{existingPresets.map(({ id, label }) => (
									<option key={id} value={id}>{label}</option>
								))}
							</select>
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
											updateState={updateState} />
									} />
									<Route path="/options" element={
										<PresetOptions
											presetNamePrepend={presetNamePrepend}
											presetNameAppend={presetNameAppend}
											limitTo={limitTo}
											updatePresetName={updateStateFromEvent}
											toggleLimitTo={toggleLimitTo} />
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
		<PresetSaveAs />
	</PresetsProvider>
)
