import React, { useContext, useMemo, useState } from 'react'
import 'css/index/acquisition.css'

import { MainContext, PrefsContext } from 'store'

import Downloader from './Downloader'
import Uploader from './Uploader'
import ScreenRecorder from './ScreenRecorder'
import ReadyQueue from './ReadyQueue'

const Acquisition = () => {
	const [ recording, setRecording ] = useState(false)
	const { url, optimize, screenshot, timer, timerEnabled, media, dispatch } = useContext(MainContext)
	const { preferences } = useContext(PrefsContext)

	const output = useMemo(() => preferences.renderOutput.split('x')[1], [preferences.renderOutput])

	return (
		<form>
			<Downloader
				url={url}
				optimize={optimize}
				output={output}
				disableRateLimit={preferences.disableRateLimit}
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
				dispatch={dispatch} />
		</form>
	)
}

export default Acquisition
