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
	const { disableRateLimit, renderOutput, screenRecorderFrameRate, warnings } = useContext(PrefsContext).preferences

	const output = useMemo(() => renderOutput.split('x')[1], [renderOutput])

	return (
		<>
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
				frameRate={screenRecorderFrameRate}
				screenshot={screenshot}
				timer={timer}
				timerEnabled={timerEnabled}
				dispatch={dispatch} />
			<ReadyQueue
				media={media}
				recording={recording}
				warnings={warnings}
				dispatch={dispatch} />
		</>
	)
}

export default Acquisition
