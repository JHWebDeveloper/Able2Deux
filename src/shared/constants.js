
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61551725265321'
const LICENSE_URL = 'http://creativecommons.org/licenses/by-nd/4.0/?ref=chooser-v1'

const INIT_PREFS_STATE = Object.freeze({
	theme: 'system',
	scratchDisk: {
		imports: '',
		exports: '',
		previews: ''
	},
	warnings: {
		remove: true,
		removeReferenced: true,
		removeAll: true,
		applyToAll: true,
		sourceOnTop: true,
		startOver: true,
		removePreset: true,
		removeReferencedPreset: true,
		removePresetFromBatch: true
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
	gridColor: '#ff00ff',
	aspectRatioMarkers: [],
	renderOutput: '1280x720',
	renderFrameRate: 'auto',
	customFrameRate: 23.98,
	concurrent: 2,
	h264Preset: 'ultrafast',
	autoPNG: true,
	batchNameSeparator: ' ',
	replaceSpaces: false,
	spaceReplacement: '_',
	convertCase: false,
	casing: 'lowercase',
	asperaSafe: true,
	saveLocations: [],
	disableRateLimit: false
})

const INIT_PRESETS_STATE = Object.freeze({
	presets: []
})

const INIT_WORKSPACE_STATE = Object.freeze({
	welcomMessageAcknowledged: false,
	windowWidth: 830,
	windowHeight: 800,
	previewHeight: 540,
	previewQuality: 1,
	grid: false,
	panels: {
		batchName: {
			open: false
		},
		preview: {
			open: true
		},
		fileOptions: {
			open: true
		},
		audio: {
			open: false
		},
		framing: {
			open: true
		},
		source: {
			open: true
		},
		centering: {
			open: true
		},
		position: {
			open: false
		},
		scale: {
			open: false
		},
		crop: {
			open: false
		},
		rotation: {
			open: false
		},
		keying: {
			open: false
		},
		colorCorrection: {
			open: false
		},
		presetNameTemplate: {
			open: false
		}
	}
})

module.exports = {
	LICENSE_URL,
	FACEBOOK_URL,
	INIT_PREFS_STATE,
	INIT_PRESETS_STATE,
	INIT_WORKSPACE_STATE
}
