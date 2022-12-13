import { app } from 'electron'
import path from 'path'
import { v1 as uuid } from 'uuid'

const tempDirectory = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'temp')
	: app.getPath('temp')

const defaultPrefs = {
	version: 9,
	theme: 'classic',
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	customFrameRate: 23.98,
	autoPNG: true,
	asperaSafe: true,
	concurrent: 2,
	scratchDisk: {
		imports: tempDirectory,
		exports: tempDirectory,
		previews: tempDirectory
	},
	optimize: 'quality',
	screenshot: false,
	timerEnabled: false,
	timer: 60,
	screenRecorderFrameRate: 60,
	editAll: false,
	sliderSnapPoints: true,
	enableWidescreenGrids: false,
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
		},
	],
	gridColor: '#ff00ff',
	split: 270,
	enable11pmBackgrounds: false,
	scaleSliderMax: 400,
	editorSettings: {
		arc: 'none',
		backgroundMotion: 'animated',
	},
	warnings: {
		remove: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true,
		startOver: true
	},
	saveLocations: [
		{
			id: uuid(),
			checked: true,
			directory: app.getPath('desktop'),
			label: 'Save to Desktop'
		}
	],
	disableRateLimit: false
}

export default defaultPrefs
