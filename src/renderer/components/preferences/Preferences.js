import React, { useContext } from 'react'
import '../../css/preferences.css'

import { PrefsProvider, PrefsContext } from '../../store/preferences'

import RenderOutput from './RenderOutput'
import ScratchDisk from './ScratchDisk'
import Defaults from './Defaults'
import SaveLocations from './SaveLocations'
import SaveAndClose from './SaveAndClose'

const Main = () => {
	const {
		renderOutput, 
		scratchDisk,
		warnings,
		scaleSliderMax,
		gridColor,
		saveLocations,
		dispatch
	} = useContext(PrefsContext)

	return (
		<form>
			<RenderOutput
				renderOutput={renderOutput}
				dispatch={dispatch} />
			<ScratchDisk 
				scratchDisk={scratchDisk}
				dispatch={dispatch} />
			<Defaults
				warnings={warnings}
				scaleSliderMax={scaleSliderMax}
				gridColor={gridColor}
				dispatch={dispatch} />
			<SaveLocations
				saveLocations={saveLocations}
				dispatch={dispatch} />
			<SaveAndClose
				prefs={{
					renderOutput, 
					scratchDisk,
					warnings,
					scaleSliderMax,
					gridColor,
					saveLocations
				}}
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
