import { app } from 'electron'
import path from 'path'
import { v1 as uuid } from 'uuid'

const tempDirectory = process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'temp')
	: app.getPath('temp')

const defaultPrefs = {
	version: 3,
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	autoPNG: true,
	asperaSafe: true,
	concurrent: 2,
	saveLocations: [
		{
			checked: true,
			directory: app.getPath('desktop'),
			id: uuid(),
			label: 'Save to Desktop'
		}
	],
	scratchDisk: {
		imports: tempDirectory,
		exports: tempDirectory,
		previews: tempDirectory
	},
	warnings: {
		remove: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true
	},
	editAll: false,
	enableWidescreenGrids: false,
	gridColor: '#ff00ff',
	scaleSliderMax: 400,
	disableRateLimit: false
}

export default defaultPrefs
