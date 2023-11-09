import { app, nativeTheme } from 'electron'
import { promises as fsp } from 'fs'
import path from 'path'
import { v1 as uuid } from 'uuid'

import { defaultPrefs, defaultPresets } from './default'
import { fileExistsPromise, innerMergeObjectKeys } from '../utilities'

const prefsDir = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'data')
	: path.join(app.getPath('appData'), 'able2', 'prefs')

// ---- PREFERENCES --------

export const prefsPath = path.join(prefsDir, 'preferences.json')

const initPreferences = async () => {
	const prefsExists = await fileExistsPromise(prefsPath)

	if (!prefsExists) {
		return fsp.writeFile(prefsPath, JSON.stringify(defaultPrefs))
	}

	const prefs = JSON.parse(await fsp.readFile(prefsPath))

	// legacy convert Able2 v1 prefs to v2
	if (!prefs.version) {
		return fsp.writeFile(prefsPath, JSON.stringify({
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
		return fsp.writeFile(prefsPath, JSON.stringify({
			...innerMergeObjectKeys(defaultPrefs, prefs),
			version: 12
		}))
	}
}

export const loadPrefs = async () => JSON.parse(await fsp.readFile(prefsPath))

export const savePrefs = async prefs => fsp.writeFile(prefsPath, JSON.stringify({
	...prefs,
	version: defaultPrefs.version
}))

export const removeSaveLocation = async locationId => {
	let prefs = await loadPrefs()

	prefs.saveLocations = prefs.saveLocations.filter(({ id }) => id !== locationId)

	return savePrefs(prefs)
}

export const getDefaultPrefs = () => defaultPrefs

export const loadTheme = async () => {
	const { theme } = await loadPrefs()

	nativeTheme.themeSource = theme
}

// ---- PRESETS --------

export const presetsPath = path.join(prefsDir, 'presets.json')

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
	const presetsExists = await fileExistsPromise(presetsPath)

	if (!presetsExists) {
		return fsp.writeFile(presetsPath, JSON.stringify(defaultPresets))
	}
}

const getPresetReferences = presets => presets.reduce((acc, { id, type, label, hidden }) => {
	if (!hidden) acc.push({ id, type, label })
	return acc
}, [])

export const loadPresets = async ({ referencesOnly, presorted }) => {
	let presets = JSON.parse(await fsp.readFile(presetsPath))

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
	const { presets } = JSON.parse(await fsp.readFile(presetsPath))

	return flattenBatchPresets(presets, presets.find(preset => preset.id === presetId))
}

export const createPreset = async ({ preset }) => {
	const presets = JSON.parse(await fsp.readFile(presetsPath))
	
	presets.presets.unshift({
		id: uuid(),
		type: 'preset',
		hidden: false,
		...preset
	})

	return fsp.writeFile(presetsPath, JSON.stringify(presets))
}

export const updatePreset = async ({ preset, saveType }) => {
	const presets = JSON.parse(await fsp.readFile(presetsPath))

	presets.presets = presets.presets.map(item => item.id === preset.id ? {
		...item,
		...preset,
		attributes: saveType === 'merge' ? {
			...item.attributes,
			...preset.attributes
		} : preset.attributes
	} : item)

	return fsp.writeFile(presetsPath, JSON.stringify(presets))
}

export const savePresets = async presets => fsp.writeFile(presetsPath, JSON.stringify({
	...presets,
	version: defaultPresets.version
}))

// ---- SHARED --------

export const initPreferencesAndPresets = async () => {
	const prefsDirExists = await fileExistsPromise(prefsDir)

	if (!prefsDirExists) await fsp.mkdir(prefsDir)

	return Promise.all([
		initPreferences(),
		initPresets()
	])
}
