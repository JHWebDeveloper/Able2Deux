import React, { useContext, useMemo } from 'react'
import '../../css/index/acquisition.css'

import { MainContext } from '../../store'
import { PrefsContext } from '../../store/preferences'

import Downloader from './Downloader'
import Uploader from './Uploader'
import ScreenRecorder from './ScreenRecorder'
import ReadyQueue from './ReadyQueue'

const Acquisition = () => {
	const { url, optimize, recording, screenshot, timer, media, dispatch } = useContext(MainContext)
	const { renderOutput, warnings, disableRateLimit } = useContext(PrefsContext)

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
				dispatch={dispatch} />
			<ReadyQueue
				media={media}
				recording={recording}
				warnings={warnings}
				dispatch={dispatch} />
		</form>
	)
}

export default Acquisition
