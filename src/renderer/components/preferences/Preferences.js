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
		renderFrameRate,
		concurrent,
		scratchDisk,
		warnings,
		editAll,
		enableWidescreenGrids,
		gridColor,
		scaleSliderMax,
		saveLocations,
		dispatch
	} = useContext(PrefsContext)

	return (
		<form>
			<RenderOutput
				renderOutput={renderOutput}
				renderFrameRate={renderFrameRate}
				concurrent={concurrent}
				dispatch={dispatch} />
			<ScratchDisk 
				scratchDisk={scratchDisk}
				dispatch={dispatch} />
			<Defaults
				warnings={warnings}
				editAll={editAll}
				enableWidescreenGrids={enableWidescreenGrids}
				gridColor={gridColor}
				scaleSliderMax={scaleSliderMax}
				dispatch={dispatch} />
			<SaveLocations
				saveLocations={saveLocations}
				dispatch={dispatch} />
			<SaveAndClose
				prefs={{
					renderOutput,
					renderFrameRate,
					concurrent,
					scratchDisk,
					warnings,
					editAll,
					enableWidescreenGrids,
					gridColor,
					scaleSliderMax,
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
