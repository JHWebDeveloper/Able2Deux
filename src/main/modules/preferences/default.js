import { app } from 'electron'
import path from 'path'
import { v1 as uuid } from 'uuid'

const tempDirectory = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'temp')
	: app.getPath('temp')

const defaultPrefs = {
	version: 9,
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
	editAll: false,
	enable11pmBackgrounds: false,
	sliderSnapPoints: true,
	split: 270,
	scaleSliderMax: 400,
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

export default defaultPrefs
