import React, { useContext, useEffect } from 'react'
import toastr from 'toastr'
import '../../css/preferences.css'

import { PrefsProvider, PrefsContext } from '../../store/preferences'
import { updateState } from '../../actions'
import { toastrOpts, createKonamiListener } from '../../utilities'

import RenderOutput from './RenderOutput'
import ScratchDisk from './ScratchDisk'
import Defaults from './Defaults'
import SaveLocations from './SaveLocations'
import SaveAndClose from './SaveAndClose'

const konami = createKonamiListener()

const Main = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { disableRateLimit } = preferences

	useEffect(() => {
		konami.listen(() => {
			dispatch(updateState({
				disableRateLimit: !disableRateLimit
			}))

			toastr.success(
				`Download Rate Limit is now ${disableRateLimit ? 'En' : 'Dis'}abled`,
				'You entered the Konami Code!',
				{ ...toastrOpts, timeOut: 2000 })
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
				asperaSafe={preferences.asperaSafe}
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
