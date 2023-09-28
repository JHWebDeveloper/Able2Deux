import { app } from 'electron'
import path from 'path'
import { v1 as uuid } from 'uuid'

const tempDirectory = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'temp')
	: app.getPath('temp')

export const defaultPrefs = {
	version: 12,
	theme: 'system',
	windowWidth: 830,
	windowHeight: 800,
	scratchDisk: {
		imports: tempDirectory,
		exports: tempDirectory,
		previews: tempDirectory
	},
	warnings: {
		remove: true,
		removeReferenced: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true,
		startOver: true
	},
	optimize: 'quality',
	screenshot: false,
	timerEnabled: false,
	screenRecorderFrameRate: 60,
	timer: 60,
	editorSettings: {
		arc: 'none',
		backgroundMotion: 'animated'
	},
	selectAllByDefault: false,
	enable11pmBackgrounds: false,
	sliderSnapPoints: true,
	split: 270,
	scaleSliderMax: 400,
	previewHeight: 540,
	previewQuality: 1,
	gridColor: '#ff00ff',
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
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	customFrameRate: 23.98,
	autoPNG: true,
	batchNameSeparator: ' ',
	replaceSpaces: false,
	spaceReplacement: '_',
	convertCase: false,
	casing: 'lowercase',
	asperaSafe: true,
	concurrent: 2,
	saveLocations: [
		{
			id: uuid(),
			hidden: false,
			checked: true,
			directory: app.getPath('desktop'),
			label: 'Save to Desktop'
		}
	],
	disableRateLimit: false
}

const limitTo = ['gif', 'image', 'video']

export const defaultPresets = {
	version: 1,
	presets: [
		{
			id: uuid(),
			type: 'preset',
			label: 'EWN BG Blue',
			hidden: false,
			limitTo,
			attributes: {
				background: 'blue',
				presetNameAppend: '- EWN BG Blue'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'EWN BG Grey',
			hidden: true,
			limitTo,
			attributes: {
				background: 'grey',
				presetNameAppend: '- EWN BG Grey'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Light Blue',
			hidden: false,
			limitTo,
			attributes: {
				background: 'light_blue',
				presetNameAppend: '- TNT BG Light Blue'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Dark Blue',
			hidden: true,
			limitTo,
			attributes: {
				background: 'dark_blue',
				presetNameAppend: '- TNT BG Dark Blue'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Teal',
			hidden: true,
			limitTo,
			attributes: {
				background: 'teal',
				presetNameAppend: '- TNT BG Teal'
			}
		},
		{
			id: uuid(),
			type: 'preset',
			label: 'TNT BG Tan',
			hidden: true,
			limitTo,
			attributes: {
				background: 'tan',
				presetNameAppend: '- TNT BG Tan'
			}
		}
	]
}

defaultPresets.presets.push(
	{
		id: uuid(),
		type: 'batchPreset',
		label: 'EWN+TNT Background',
		limitToOverwrite: false,
		limitTo,
		hidden: false,
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
		limitToOverwrite: false,
		limitTo,
		attributes: {},
		presetIds: defaultPresets.presets.map(({ id }) => id)
	}
)
