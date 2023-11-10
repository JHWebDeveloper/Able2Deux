import React, { useCallback, useContext, useEffect } from 'react'

import 'css/presets.css'

import {
	DraggingProvider,
	PrefsContext,
	PrefsProvider,
	PresetsProvider,
	PresetsContext
} from 'store'

import {
	addNewPreset,
	loadPresetsForEditing,
	selectPresetByIndex,
	updatePresetStateBySelection
} from 'actions'

import {
	createNewBatchPresetAttributeSet,
	createNewPresetAttributeSet,
	focusSelectableItem
} from 'utilities'

import MainForm from '../form_elements/MainForm'
import PresetSelector from './PresetSelector'
import PresetEditor from './PresetEditor'
import ButtonWithIcon from '../form_elements/ButtonWithIcon'
import SaveAndClose from './SaveAndClose'

const Presets = () => {
	const { presets: { presets: allPresets }, dispatch } = useContext(PresetsContext)

	const [ presets, batchPresets] = allPresets
		.reduce((acc, item) => {
			acc[item.type === 'batchPreset' ? 1 : 0].push(item)
			return acc
		}, [[], []])
		.map((presetGroup, i, [, _batchPresets ]) => presetGroup.map(item => ({
			...item,
			hasReferences: _batchPresets.some(({ presetIds }) => presetIds.includes(item.id)) 
		})))
	
	const focused = allPresets.find(item => item.focused) || {}
	const presetIdList = allPresets.reduce((acc, { id }) => `${acc}${id}`, '')
	const presetsLength = presets.length
	const batchPresetsLength = batchPresets.length

	const updatePresetStateFromEvent = useCallback(e => {
		const { name, value } = e?.target || e

		dispatch(updatePresetStateBySelection({
			[name]: value
		}))
	}, [])

	const createNewPreset = useCallback(() => {
		dispatch(addNewPreset(createNewPresetAttributeSet(presetsLength, true), presetsLength))
	}, [presetsLength])

	const createNewBatchPreset = useCallback(() => {
		dispatch(addNewPreset(createNewBatchPresetAttributeSet(batchPresetsLength, true), presetsLength + batchPresetsLength))
	}, [batchPresetsLength, presetsLength])

	useEffect(() => {
		if (focused.id) {
			focusSelectableItem('.preset-selector')
		} else {
			dispatch(selectPresetByIndex(0))
		}
	}, [focused.id, presetIdList])

	return (
		<>
			<MainForm>
				<DraggingProvider>
					<PresetSelector
						presets={presets}
						batchPresets={batchPresets}
						presetsLength={presetsLength}
						batchPresetsLength={batchPresetsLength}
						dispatch={dispatch} />
					{presetsLength || batchPresetsLength ? (
						<PresetEditor
							focused={focused}
							updatePresetState={updatePresetStateFromEvent}
							dispatch={dispatch} />
					) : <></>}
				</DraggingProvider>
			</MainForm>
			<footer>
				<ButtonWithIcon
					label="Preset"
					icon="add"
					onClick={createNewPreset} />
				<ButtonWithIcon
					label="Batch Preset"
					icon="add"
					onClick={createNewBatchPreset} />
				<SaveAndClose dispatch={dispatch} />
			</footer>
		</>
	)
}

const PresetsMountWithAsyncDependencies = () => {
	const { presetsLoaded } = useContext(PresetsContext)
	const { prefsLoaded } = useContext(PrefsContext)

	return presetsLoaded && prefsLoaded
		? <Presets />
		: <></>
}

export default () => (
	<PrefsProvider enableSync>
		<PresetsProvider loadAction={loadPresetsForEditing}>
			<PresetsMountWithAsyncDependencies />
		</PresetsProvider>
	</PrefsProvider>
)
