import { app } from 'electron'
import { v1 as uuid } from 'uuid'

import {
	DEFAULT_LIMIT_TO,
	INIT_PREFS_STATE,
	INIT_PRESETS_STATE,
	INIT_WORKSPACE_STATE,
	TEMP_DIRECTORY_PATH
} from '../constants'

export const defaultPrefs = {
	...INIT_PREFS_STATE,
	version: 12,
	scratchDisk: {
		imports: TEMP_DIRECTORY_PATH,
		exports: TEMP_DIRECTORY_PATH,
		previews: TEMP_DIRECTORY_PATH
	},
	aspectRatioMarkers: [
		{
			id: uuid(),
			label: '9:16',
			disabled: false,
			selected: false,
			ratio: [9, 16]
		},
		{
			id: uuid(),
			label: '1:1',
			disabled: false,
			selected: false,
			ratio: [1, 1]
		},
		{
			id: uuid(),
			label: '4:3',
			disabled: false,
			selected: false,
			ratio: [4, 3]
		},
		{
			id: uuid(),
			label: '1.66',
			disabled: true,
			selected: false,
			ratio: [5, 3]
		},
		{
			id: uuid(),
			label: '1.85',
			disabled: true,
			selected: false,
			ratio: [1.85, 1]
		},
		{
			id: uuid(),
			label: '2.39',
			disabled: true,
			selected: false,
			ratio: [2.39, 1]
		}
	],
	saveLocations: [
		{
			id: uuid(),
			hidden: false,
			checked: true,
			directory: app.getPath('desktop'),
			label: 'Save to Desktop'
		}
	]
}

export const defaultPresets = {
	...INIT_PRESETS_STATE,
	version: 1,
	presets: [
		{
			id: uuid(),
			type: 'preset',
			label: 'EWN BG Blue',
			hidden: false,
			limitTo: [...DEFAULT_LIMIT_TO],
			attributes: {
				background: 'blue',
				presetNameAppend: 'EWN BG Blue'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'EWN BG Grey',
			hidden: true,
			limitTo: [...DEFAULT_LIMIT_TO],
			attributes: {
				background: 'grey',
				presetNameAppend: 'EWN BG Grey'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Light Blue',
			hidden: false,
			limitTo: [...DEFAULT_LIMIT_TO],
			attributes: {
				background: 'light_blue',
				presetNameAppend: 'TNT BG Light Blue'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Dark Blue',
			hidden: true,
			limitTo: [...DEFAULT_LIMIT_TO],
			attributes: {
				background: 'dark_blue',
				presetNameAppend: 'TNT BG Dark Blue'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Teal',
			hidden: true,
			limitTo: [...DEFAULT_LIMIT_TO],
			attributes: {
				background: 'teal',
				presetNameAppend: 'TNT BG Teal'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Tan',
			hidden: true,
			limitTo: [...DEFAULT_LIMIT_TO],
			attributes: {
				background: 'tan',
				presetNameAppend: 'TNT BG Tan'
			}
		}
	]
}

defaultPresets.presets.push(
	{
		id: uuid(),
		type: 'batchPreset',
		label: 'EWN+TNT Background',
		hidden: false,
		attributeMergeType: 'overwrite',
		presetNamePrependMergeType: 'replace',
		presetNameAppendMergeType: 'replace',
		limitTo: [...DEFAULT_LIMIT_TO],
		limitToOverwrite: false,
		attributes: {},
		presetIds: [
			defaultPresets.presets[0].id,
			defaultPresets.presets[2].id
		]
	},
	{
		id: uuid(),
		type: 'batchPreset',
		label: 'All Backgrounds',
		hidden: false,
		attributeMergeType: 'overwrite',
		presetNamePrependMergeType: 'replace',
		presetNameAppendMergeType: 'replace',
		limitTo: [...DEFAULT_LIMIT_TO],
		limitToOverwrite: false,
		attributes: {},
		presetIds: defaultPresets.presets.map(({ id }) => id)
	}
)

export const defaultWorkspace = {
	...INIT_WORKSPACE_STATE,
	version: 1
}
