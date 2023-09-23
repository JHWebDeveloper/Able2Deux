import React, { useCallback, useContext, useEffect, useId, useState } from 'react'
import { HashRouter, NavLink, Routes, Route } from 'react-router-dom'
import toastr from 'toastr'
import '../../css/preset_save_as.css'

import { PresetsProvider, PresetsContext } from 'store'
import { MEDIA_TYPES, TOASTR_OPTIONS, errorToString } from 'utilities'

import RadioSet from '../form_elements/RadioSet'
import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import SelectAttributes from './SelectAttributes'
import FilenameOptions from './FilenameOptions'

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

const attributeToPreset = ([attribute, value], attributes) => {
	const attributeData = {
		include: true,
		attribute,
		value
	}

	switch (attribute) {
		case 'audioVideoTracks':
			attributeData.label = 'Export As'
			attributeData.order = 0
			break
		case 'audioExportFormat':
			attributeData.label = 'Format'
			attributeData.order = 1
			break
		case 'arc':
			attributeData.label = 'AR Correction'
			attributeData.order = 3
			break
		case 'background':
			attributeData.label = 'Background'
			attributeData.include = attributes.arc !== 'none'
			attributeData.order = 4
			break
		case 'bgColor':
			attributeData.label = 'Background Color'
			attributeData.include = attributes.arc !== 'none' && attributes.background === 'color'
			attributeData.order = 5
			break
		case 'backgroundMotion':
			attributeData.label = 'Background Motion'
			attributeData.include = attributes.arc !== 'none' && attributes.background !== 'alpha' && attributes.background !== 'color'
			attributeData.order = 6
			break
		case 'overlay':
			attributeData.label = 'Overlay'
			attributeData.include = attributes.arc !== 'none'
			attributeData.order = 7
			break
		case 'sourceName':
			attributeData.label = 'Source'
			attributeData.include = !!attributes.sourceName
			attributeData.order = 8
			break
		case 'sourcePrefix':
			attributeData.label = 'Add "Source: " to beginning'
			attributeData.include = !!attributes.sourceName
			attributeData.order = 9
			break
		case 'sourceOnTop':
			attributeData.label = 'Place source at top of video'
			attributeData.include = !!attributes.sourceName
			attributeData.order = 10
			break
		case 'centering':
			attributeData.label = 'Centering'
			attributeData.order = 11
			break
		case 'positionX':
			attributeData.label = 'Position X'
			attributeData.order = 12
			break
		case 'positionY':
			attributeData.label = 'Position Y'
			attributeData.order = 13
			break
		case 'scaleX':
			attributeData.label = 'Scale X'
			attributeData.order = 14
			break
		case 'scaleY':
			attributeData.label = 'Scale Y'
			attributeData.order = 15
			break
		case 'scaleLink':
			attributeData.label = 'Link Scale X & Y'
			attributeData.order = 16
			break
		case 'cropT':
			attributeData.label = 'Crop Top'
			attributeData.order = 17
			break
		case 'cropB':
			attributeData.label = 'Crop Bottom'
			attributeData.order = 18
			break
		case 'cropL':
			attributeData.label = 'Crop Left'
			attributeData.order = 19
			break
		case 'cropR':
			attributeData.label = 'Crop Right'
			attributeData.order = 20
			break
		case 'cropLinkTB':
			attributeData.label = 'Link Crop Top & Bottom'
			attributeData.order = 21
			break
		case 'cropLinkLR':
			attributeData.label = 'Link Crop Left & Right'
			attributeData.order = 22
			break
		case 'reflect':
			attributeData.label = 'Reflect'
			attributeData.order = 23
			break
		case 'transpose':
			attributeData.label = 'Rotate'
			attributeData.order = 24
			break
		case 'freeRotateMode':
			attributeData.label = 'Free Rotate Mode'
			attributeData.order = 25
			break
		case 'angle':
			attributeData.label = 'Free Rotate Angle'
			attributeData.order = 26
			break
		case 'rotatedCentering':
			attributeData.label = 'Free Rotate Centering'
			attributeData.include = attributes.freeRotateMode === 'inside_bounds'
			attributeData.order = 27
			break
		case 'keyingEnabled':
			attributeData.label = 'Keying On/Off'
			attributeData.order = 28
			break
		case 'keyingType':
			attributeData.label = 'Key Type'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 29
			break
		case 'keyingColor':
			attributeData.label = 'Key Color'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 30
			break
		case 'keyingSimilarity':
			attributeData.label = 'Similarity'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 31
			break
		case 'keyingBlend':
			attributeData.label = 'Blend'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 32
			break
		case 'keyingThreshold':
			attributeData.label = 'Threshold'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 33
			break
		case 'keyingTolerance':
			attributeData.label = 'Tolerance'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 34
			break
		case 'keyingSoftness':
			attributeData.label = 'Softness'
			attributeData.include = attributes.keyingEnabled
			attributeData.order = 35
			break
		case 'ccEnabled':
			attributeData.label = 'Color Correction On/Off'
			attributeData.order = 36
			break
		case 'ccRGB':
			attributeData.label = 'RGB'
			attributeData.include = attributes.ccEnabled
			attributeData.order = 37
			break
		case 'ccR':
			attributeData.label = 'R'
			attributeData.include = attributes.ccEnabled
			attributeData.order = 38
			break
		case 'ccG':
			attributeData.label = 'G'
			attributeData.include = attributes.ccEnabled
			attributeData.order = 39
			break
		case 'ccB':
			attributeData.label = 'B'
			attributeData.include = attributes.ccEnabled
			attributeData.order = 40
			break
		default:
			attributeData.label = attribute
	}

	return attributeData
}

const mapAttributesToPreset = attributes => Object
	.entries(attributes)
	.map(entries => attributeToPreset(entries, attributes))
	.sort((a, b) => a.order - b.order)

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
		presets: [],
		presetNamePrepend: '',
		presetNameAppend: '',
		limitTo: [...MEDIA_TYPES]
	})

	const { saveType, presetName, selectedPreset, presets, presetNamePrepend, presetNameAppend, limitTo } = state
	const saveEnabled = (saveType === 'newPreset' && presetName.length || selectedPreset) && presets.some(({ include }) => include)

	const updateStateFromEvent = useCallback(e => {
		updateState(currentState => ({
			...currentState,
			[e.target.name]: e.target.value
		}))
	}, [])

	const savePreset = async () => {
		try {
			await interop.savePreset({
				attributes: {
					...mapPresetToAttributes(presets),
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
			const { presetNamePrepend, presetNameAppend, ...presets } = await interop.getPresetToSave()

			updateState(currentState => ({
				...currentState,
				presets: mapAttributesToPreset(presets),
				presetNamePrepend: presetNameAppend ?? '',
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
			<main>
				<form>
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
							<fieldset>
								<legend>Preset Name<span aria-hidden>:</span></legend>
								<input
									type="text"
									className="panel-input"
									name="presetName"
									maxLength={50}
									value={presetName}
									onChange={updateStateFromEvent} />
							</fieldset>
						) : (
							<fieldset>
								<legend>Select Preset<span aria-hidden>:</span></legend>
								<select
									className="panel-input"
									name="selectedPreset"
									value={selectedPreset}
									onChange={updateStateFromEvent}>
									{existingPresets.map(({ id, label }) => (
										<option key={id} value={id}>{label}</option>
									))}
								</select>
							</fieldset>
						)}
					</section>
					<section className="preset-settings">
						<HashRouter>
							<nav>
								<NavLink to="/" title="Attributes">Attributes</NavLink>
								<NavLink to="/options" title="Filename Options">Filename Options</NavLink>
							</nav>
							<div>
								<Routes>
									<Route path="/" element={
										<SelectAttributes
											presets={presets}
											updateState={updateState} />
									} />
									<Route path="/options" element={
										<FilenameOptions
											presetNamePrepend={presetNamePrepend}
											presetNameAppend={presetNameAppend}
											limitTo={limitTo}
											updateStateFromEvent={updateStateFromEvent}
											updateState={updateState} />
									} />
									<Route />
								</Routes>
							</div>
						</HashRouter>
					</section>
				</form>
			</main>
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
