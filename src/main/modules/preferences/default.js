import path from 'path'
import { app } from 'electron'
import { v1 as uuid } from 'uuid'

const tempDirectory = process.env.NODE_ENV === 'development'
	? path.resolve(__dirname, '..', '..', 'temp')
	: path.join(app.getPath('temp'))

const defaultPrefs = {
	renderOutput: '1280x720',
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
	scaleSliderMax: 400,
	gridColor: '#ff00ff'
}

export default defaultPrefs
