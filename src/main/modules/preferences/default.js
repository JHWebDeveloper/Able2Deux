import { app } from 'electron'
import path from 'path'
import { v1 as uuid } from 'uuid'

const tempDirectory = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'temp')
	: app.getPath('temp')

const defaultPrefs = {
	version: 7,
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
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
	gridColor: '#ff00ff',
	split: 270,
	scaleSliderMax: 400,
	warnings: {
		remove: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true,
		startOver: true
	},
	saveLocations: [
		{
			checked: true,
			directory: app.getPath('desktop'),
			id: uuid(),
			label: 'Save to Desktop'
		}
	],
	disableRateLimit: false
}

export default defaultPrefs
