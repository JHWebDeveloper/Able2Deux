import React, { useContext, useMemo, useState } from 'react'
import '../../css/index/acquisition.css'

import { MainContext } from '../../store'
import { PrefsContext } from '../../store/preferences'

import Downloader from './Downloader'
import Uploader from './Uploader'
import ScreenRecorder from './ScreenRecorder'
import ReadyQueue from './ReadyQueue'

const Acquisition = () => {
	const { url, optimize, recording, timer, media, dispatch } = useContext(MainContext)
	const { renderOutput, warnings } = useContext(PrefsContext)

	const output = useMemo(() => renderOutput.split('x')[1], [renderOutput])

	return (
		<form>
			<Downloader
				url={url}
				optimize={optimize}
				output={output}
				dispatch={dispatch} />
			<Uploader
				dispatch={dispatch} />
			<ScreenRecorder
				recording={recording}
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
