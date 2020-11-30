import React, { useContext, useMemo } from 'react'
import 'css/index/acquisition.css'

import { MainContext } from 'store'
import { PrefsContext } from 'store/preferences'

import Downloader from './Downloader'
import Uploader from './Uploader'
import ScreenRecorder from './ScreenRecorder'
import ReadyQueue from './ReadyQueue'

const Acquisition = () => {
	const { url, optimize, recording, screenshot, timer, timerEnabled, media, dispatch } = useContext(MainContext)
	const prefsCtx = useContext(PrefsContext)
	const { preferences } = prefsCtx
	const { renderOutput, disableRateLimit } = preferences

	const output = useMemo(() => renderOutput.split('x')[1], [renderOutput])

	return (
		<form>
			<Downloader
				url={url}
				optimize={optimize}
				output={output}
				disableRateLimit={disableRateLimit}
				dispatch={dispatch} />
			<Uploader
				dispatch={dispatch} />
			<ScreenRecorder
				recording={recording}
				screenshot={screenshot}
				timer={timer}
				timerEnabled={timerEnabled}
				dispatch={dispatch} />
			<ReadyQueue
				media={media}
				recording={recording}
				warnings={preferences.warnings}
				dispatch={dispatch}
				prefsDispatch={prefsCtx.dispatch} />
		</form>
	)
}

export default Acquisition
