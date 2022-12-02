import React, { useContext, useEffect } from 'react'
import toastr from 'toastr'
import 'css/preferences.css'

import { PrefsProvider, PrefsContext } from 'store/preferences'
import { updateState } from 'actions'
import { toastrOpts, createKonamiListener } from 'utilities'

import RenderOutput from './RenderOutput'
import ScratchDisk from './ScratchDisk'
import AcquisitionSettings from './AcquisitionSettings'
import FormattingSettings from './FormattingSettings'
import Warnings from './Warnings'
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
			<AcquisitionSettings
				optimize={preferences.optimize}
				screenshot={preferences.screenshot}
				screenRecorderFrameRate={preferences.screenRecorderFrameRate}
				timerEnabled={preferences.timerEnabled}
				timer={preferences.timer}
				dispatch={dispatch} />
			<FormattingSettings
				editAll={preferences.editAll}
				sliderSnapPoints={preferences.sliderSnapPoints}
				aspectRatioMarkers={preferences.aspectRatioMarkers}
				gridColor={preferences.gridColor}
				split={preferences.split}
				scaleSliderMax={preferences.scaleSliderMax}
				dispatch={dispatch} />
			<Warnings
				warnings={preferences.warnings}
				dispatch={dispatch} />
			<ScratchDisk 
				scratchDisk={preferences.scratchDisk}
				dispatch={dispatch} />
			<RenderOutput
				renderOutput={preferences.renderOutput}
				renderFrameRate={preferences.renderFrameRate}
				customFrameRate={preferences.customFrameRate}
				autoPNG={preferences.autoPNG}
				asperaSafe={preferences.asperaSafe}
				concurrent={preferences.concurrent}
				dispatch={dispatch} />
			<SaveLocations
				saveLocations={preferences.saveLocations}
				dispatch={dispatch} />
			<SaveAndClose dispatch={dispatch} />
		</form>
	)
}

const Preferences = () => (
	<PrefsProvider>
		<Main />
	</PrefsProvider>
)

export default Preferences
