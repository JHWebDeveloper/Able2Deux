import React, { useContext, useEffect } from 'react'
import toastr from 'toastr'
import '../../css/preferences.css'

import { PrefsProvider, PrefsContext } from '../../store/preferences'
import { toastrOpts } from '../../utilities'

import RenderOutput from './RenderOutput'
import ScratchDisk from './ScratchDisk'
import Defaults from './Defaults'
import SaveLocations from './SaveLocations'
import SaveAndClose from './SaveAndClose'

class Konami {
	constructor() {
		this.keys = [38, 38, 40, 40, 37, 39, 37, 39, 65, 66, 13]
		this.count = 0
		this.callback = false
	}

	log = e => {
		const match = e.keyCode === this.keys[this.count]

		if (match && this.count === this.keys.length - 1) {
			this.callback()
			this.count = 0
		} else if (match) {
			this.count += 1
		} else {
			this.count = 0
		}
	}

	listen = callback => {
		this.callback = callback
		window.addEventListener('keydown', this.log)
	}

	remove = () => {
		this.callback = false
		window.removeEventListener('keydown', this.log)
	}
}

const konami = new Konami()

const Main = () => {
	const { preferences, dispatch } = useContext(PrefsContext)

	useEffect(() => {
		konami.listen(() => {
			toastr.success(`Download Rate Limit ${preferences.disableRateLimit ? 'Dis' : 'En'}abled`, toastrOpts)
		})

		return () => {
			konami.remove()
		}
	})

	return (
		<form>
			<RenderOutput
				renderOutput={preferences.renderOutput}
				renderFrameRate={preferences.renderFrameRate}
				autoPNG={preferences.autoPNG}
				concurrent={preferences.concurrent}
				dispatch={dispatch} />
			<ScratchDisk 
				scratchDisk={preferences.scratchDisk}
				dispatch={dispatch} />
			<Defaults
				warnings={preferences.warnings}
				editAll={preferences.editAll}
				enableWidescreenGrids={preferences.enableWidescreenGrids}
				gridColor={preferences.gridColor}
				scaleSliderMax={preferences.scaleSliderMax}
				dispatch={dispatch} />
			<SaveLocations
				saveLocations={preferences.saveLocations}
				dispatch={dispatch} />
			<SaveAndClose
				prefs={preferences}
				dispatch={dispatch} />
		</form>
	)
}

const Preferences = () => (
	<PrefsProvider>
		<Main />
	</PrefsProvider>
)

export default Preferences
