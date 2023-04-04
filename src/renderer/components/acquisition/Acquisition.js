import React, { useContext, useMemo, useState } from 'react'
import 'css/index/acquisition.css'

import { MainContext } from 'store'
import { PrefsContext } from 'store'

import Downloader from './Downloader'
import Uploader from './Uploader'
import ScreenRecorder from './ScreenRecorder'
import ReadyQueue from './ReadyQueue'

const Acquisition = () => {
	const [ recording, setRecording ] = useState(false)
	const { url, optimize, screenshot, timer, timerEnabled, media, dispatch } = useContext(MainContext)
	const { preferences, dispatch: prefsDispatch } = useContext(PrefsContext)
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
			<Uploader dispatch={dispatch} />
			<ScreenRecorder
				recording={recording}
				setRecording={setRecording}
				frameRate={preferences.screenRecorderFrameRate}
				screenshot={screenshot}
				timer={timer}
				timerEnabled={timerEnabled}
				dispatch={dispatch} />
			<ReadyQueue
				media={media}
				recording={recording}
				warnings={preferences.warnings}
				dispatch={dispatch}
				prefsDispatch={prefsDispatch} />
		</form>
	)
}

export default Acquisition
