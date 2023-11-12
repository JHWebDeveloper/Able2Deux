import React, { useContext, useEffect, useMemo, useState } from 'react'
import 'css/index/acquisition.css'

import { ImportQueueContext, ImportQueueProvider, MainContext, PrefsContext } from 'store'
import { addMedia, removeSortableElement } from 'actions'
import { STATUS } from 'constants'

import Downloader from './Downloader'
import Uploader from './Uploader'
import ScreenRecorder from './ScreenRecorder'
import ReadyQueue from './ReadyQueue'

const Acquisition = () => {
	const [ recording, setRecording ] = useState(false)
	const { media: pendingMedia, dispatch: importQueueDispatch } = useContext(ImportQueueContext)
	const { url, optimize, screenshot, timer, timerEnabled, media, dispatch } = useContext(MainContext)
	const { disableRateLimit, renderOutput, screenRecorderFrameRate, warnings } = useContext(PrefsContext).preferences

	const output = useMemo(() => renderOutput.split('x')[1], [renderOutput])

	useEffect(() => {
		for (const item of pendingMedia) {
			if (item.status === STATUS.READY) {
				importQueueDispatch(removeSortableElement(item.id))
				dispatch(addMedia(item))
			}
		}
	}, [pendingMedia])

	return (
		<>
			<Downloader
				url={url}
				optimize={optimize}
				output={output}
				disableRateLimit={disableRateLimit}
				dispatch={dispatch}
				importQueueDispatch={importQueueDispatch} />
			<Uploader importQueueDispatch={importQueueDispatch} />
			<ScreenRecorder
				recording={recording}
				setRecording={setRecording}
				frameRate={screenRecorderFrameRate}
				screenshot={screenshot}
				timer={timer}
				timerEnabled={timerEnabled}
				dispatch={dispatch} />
			<ReadyQueue
				pendingMedia={pendingMedia}
				media={media}
				recording={recording}
				warnings={warnings}
				dispatch={dispatch}
				importQueueDispatch={importQueueDispatch} />
		</>
	)
}

export default () => (
	<ImportQueueProvider>
		<Acquisition />
	</ImportQueueProvider>
)
