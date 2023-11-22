import { nativeTheme } from 'electron'
import { promises as fsp } from 'fs'
import { v1 as uuid } from 'uuid'

import { defaultPrefs, defaultPresets, defaultWorkspace } from './default'

import {
	DATA_STORE_PATH,
	PREFERENCES_PATH,
	PRESETS_PATH,
	WORKSPACE_PATH
} from '../constants'

import { fileExistsPromise, innerMergeObjectKeys } from '../utilities'

// ---- PREFERENCES --------

const initPreferences = async () => {
	const prefsExists = await fileExistsPromise(PREFERENCES_PATH)

	if (!prefsExists) {
		return fsp.writeFile(PREFERENCES_PATH, JSON.stringify(defaultPrefs))
	}

	const prefs = JSON.parse(await fsp.readFile(PREFERENCES_PATH))

	// legacy convert Able2 v1 prefs to v2
	if (!prefs.version) {
		return fsp.writeFile(PREFERENCES_PATH, JSON.stringify({
			...defaultPrefs,
			renderOutput: prefs?.renderOutput ?? defaultPrefs.renderOutput,
			saveLocations: prefs?.directories ?? defaultPrefs.saveLocations,
			warnings: {
				...defaultPrefs.warnings,
				sourceOnTop: prefs?.sourceOnTopWarning ?? defaultPrefs.directories
			}
		})) 
	}

	// fix type error from prefs 5 and earlier
	if (prefs.version < 6 && prefs.scaleSliderMax && typeof prefs.scaleSliderMax === 'string') {
		prefs.scaleSliderMax = parseFloat(prefs.scaleSliderMax)
	}

	if (prefs.version < 7 && prefs.enableWidescreenGrids) {
		defaultPrefs.aspectRatioMarkers[0].disabled = !prefs.enableWidescreenGrids
		defaultPrefs.aspectRatioMarkers[1].disabled = !prefs.enableWidescreenGrids
	}

	if (prefs.version < 7 && prefs.renderFrameRate) {
		prefs.renderFrameRate = prefs.renderFrameRate.replace(/fps$/, '')
	}

	if (prefs.version < 8 && prefs.gridButtons) {
		defaultPrefs.aspectRatioMarkers[0].disabled = !prefs.gridButtons._239
		defaultPrefs.aspectRatioMarkers[1].disabled = !prefs.gridButtons._185
		defaultPrefs.aspectRatioMarkers[2].disabled = !prefs.gridButtons._166
		defaultPrefs.aspectRatioMarkers[3].disabled = !prefs.gridButtons._43
		defaultPrefs.aspectRatioMarkers[4].disabled = !prefs.gridButtons._11
		defaultPrefs.aspectRatioMarkers[5].disabled = !prefs.gridButtons._916
	}

	if (prefs.version < 9 && prefs.saveLocations) {
		prefs.saveLocations = prefs.saveLocations.map(loc => ({ ...loc, hidden: false }))
	}

	if (prefs.version < 9 && prefs.aspectRatioMarkers) {			
		prefs.aspectRatioMarkers.reverse()
	}

	if (prefs.version < 12 && prefs.editAll) {
		defaultPrefs.selectAllByDefault = true
	}

	if (prefs.version < 12) {
		return fsp.writeFile(PREFERENCES_PATH, JSON.stringify({
			...innerMergeObjectKeys(defaultPrefs, prefs),
			version: 12
		}))
	}
}

export const loadPrefs = async () => {
	const { version, ...preferences } = JSON.parse(await fsp.readFile(PREFERENCES_PATH))

	return preferences
}

export const savePrefs = async prefs => fsp.writeFile(PREFERENCES_PATH, JSON.stringify({
	...prefs,
	version: defaultPrefs.version
}))

export const removeSaveLocation = async locationId => {
	const prefs = await loadPrefs()

	prefs.saveLocations = prefs.saveLocations.filter(({ id }) => id !== locationId)

	return savePrefs(prefs)
}

export const getDefaultPrefs = () => defaultPrefs

export const loadTheme = async () => {
	const { theme } = await loadPrefs()

	nativeTheme.themeSource = theme
}

// ---- PRESETS --------

const partitionPresets = presets => ({
	...presets,
	...presets.presets.reduce((acc, preset) => {
		switch (preset.type) {
			case 'preset':
				acc.presets.push(preset)
				break
			case 'batchPreset':
				acc.batchPresets.push(preset)
			// no default needed here. filter out any manipulations to preset.type in the JSON
		}

		return acc
	}, {
		presets: [],
		batchPresets: []
	})
})

const initPresets = async () => {
	const presetsExists = await fileExistsPromise(PRESETS_PATH)

	if (!presetsExists) {
		return fsp.writeFile(PRESETS_PATH, JSON.stringify(defaultPresets))
	}
}

const getPresetReferences = presets => presets.reduce((acc, { id, type, label, hidden }) => {
	if (!hidden) acc.push({ id, type, label })
	return acc
}, [])

export const loadPresets = async ({ referencesOnly, presorted }) => {
	let { version, ...presets } = JSON.parse(await fsp.readFile(PRESETS_PATH))

	if (referencesOnly) {
		presets.presets = getPresetReferences(presets.presets)
	}

	if (presorted) {
		presets = partitionPresets(presets)
	}

	return presets
}

const mergePresetNames = (mergeType, presetName = '', referencedPesetName = '') => {
	if (!presetName.length) return referencedPesetName

	switch (mergeType) {
		case 'replace':
			return presetName
		case 'prepend':
			return `${presetName}${referencedPesetName}`
		case 'append':
			return `${referencedPesetName}${presetName}`
		default:
			return referencedPesetName
	}
}

const flattenBatchPresets = (presets, preset, parentIds = []) => preset.type === 'batchPreset'
	? preset.presetIds
		.filter(refId => !parentIds.includes(refId))
		.flatMap(refId => flattenBatchPresets(presets, presets.find(({ id }) => id === refId), [...parentIds, refId]))
		.map(referencedPreset => ({
			...referencedPreset,
			limitTo: (preset.limitToOverwrite ? preset : referencedPreset).limitTo,
			attributes: {
				...preset.attributeMergeType === 'fallback' ? {
					...preset.attributes,
					...referencedPreset.attributes
				} : {
					...referencedPreset.attributes,
					...preset.attributes
				},
				presetNamePrepend: mergePresetNames(
					preset.presetNamePrependMergeType,
					preset.attributes.presetNamePrepend,
					referencedPreset.attributes.presetNamePrepend
				),
				presetNameAppend: mergePresetNames(
					preset.presetNameAppendMergeType,
					preset.attributes.presetNameAppend,
					referencedPreset.attributes.presetNameAppend
				)
			}
		}))
	: [preset]

export const getPresetAttributes = async ({ presetId }) => {
	const { presets } = JSON.parse(await fsp.readFile(PRESETS_PATH))

	return flattenBatchPresets(presets, presets.find(preset => preset.id === presetId))
}

export const createPreset = async ({ preset }) => {
	const presets = JSON.parse(await fsp.readFile(PRESETS_PATH))
	
	presets.presets.unshift({
		id: uuid(),
		type: 'preset',
		hidden: false,
		...preset
	})

	return fsp.writeFile(PRESETS_PATH, JSON.stringify(presets))
}

export const updatePreset = async ({ preset, saveType }) => {
	const presets = JSON.parse(await fsp.readFile(PRESETS_PATH))

	presets.presets = presets.presets.map(item => item.id === preset.id ? {
		...item,
		...preset,
		attributes: saveType === 'merge' ? {
			...item.attributes,
			...preset.attributes
		} : preset.attributes
	} : item)

	return fsp.writeFile(PRESETS_PATH, JSON.stringify(presets))
}

export const savePresets = async presets => fsp.writeFile(PRESETS_PATH, JSON.stringify({
	...presets,
	version: defaultPresets.version
}))

// ---- WORKSPACE --------

const initWorkspace = async () => {
	const workspaceExists = await fileExistsPromise(WORKSPACE_PATH)

	if (!workspaceExists) {
		return fsp.writeFile(WORKSPACE_PATH, JSON.stringify(defaultWorkspace))
	}
}

export const loadWorkspace = async () => {
	const { version, ...workspace } = JSON.parse(await fsp.readFile(WORKSPACE_PATH))

	return workspace
}

const writeToWorkspace = async workspace => fsp.writeFile(WORKSPACE_PATH, JSON.stringify({
	...workspace,
	version: defaultWorkspace.version
}))

export const saveWorkspace = async data => {
	const workspace = await loadWorkspace()

	writeToWorkspace({
		...workspace,
		...data
	})
}

export const saveWorkspacePanel = async ({ panelName, properties }) => {
	const workspace = await loadWorkspace()
	
	writeToWorkspace({
		...workspace,
		panels: {
			...workspace.panels,
			[panelName]: {
				...workspace.panels[panelName],
				...properties
			}
		}
	})
}

// ---- SHARED --------

export const initDataStores = async () => {
	const dataStorePathExists = await fileExistsPromise(DATA_STORE_PATH)

	if (!dataStorePathExists) await fsp.mkdir(DATA_STORE_PATH)

	return Promise.all([
		initPreferences(),
		initPresets(),
		initWorkspace()
	])
}
