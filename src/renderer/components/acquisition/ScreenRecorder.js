import React, { useCallback, useMemo, useRef, useState } from 'react'
import { bool, func, number } from 'prop-types'
import toastr from 'toastr'

import * as STATUS from 'status'

import {
	setRecording,
	loadRecording,
	updateMediaStatus,
	toggleCheckbox
} from 'actions'

import { toastrOpts } from 'utilities'

import RecordSourceSelector from './RecordSourceSelector'
import ScreenRecorderTimer from './ScreenRecorderTimer'
import SoundflowerMessage from './SoundflowerMessage'
import DurationPointer from '../svg/DurationPointer'
import CaptureModeSwitch from '../svg/CaptureModeSwitch'

const { interop } = window.ABLE2

const ScreenRecorder = ({ recording, screenshot, timer, timerEnabled, dispatch }) => {
	const [ recordSources, setRecordSources ] = useState([])

	const startRecording = useCallback(async streamId => {
		try {
			interop.startRecording({
				streamId,
				timer,
				setRecordIndicator: isRecording => {
					dispatch(setRecording(isRecording))
				},
				onStart: recordId => {
					dispatch(loadRecording(recordId))
				},
				onComplete: (recordId, mediaData) => {
					dispatch(updateMediaStatus(recordId, STATUS.READY, mediaData))
				},
				onSaveError: recordId => {
					dispatch(updateMediaStatus(recordId, STATUS.FAILED))
					toastr.error('Error saving screen record', false, toastrOpts)
				}
			})
		} catch (err) {
			toastr.error('An error occurred during the screen record!', false, toastrOpts)
		}
	}, [timer])

	const captureScreenshot = useCallback(async streamId => {
		try {
			interop.captureScreenshot({
				streamId,
				onCapture: (recordId, mediaData) => {
					dispatch(loadRecording(recordId, true))
					dispatch(updateMediaStatus(recordId, STATUS.READY, mediaData))
				},
				onError: recordId => {
					dispatch(updateMediaStatus(recordId, STATUS.FAILED))
					toastr.error('Error saving screenshot', false, toastrOpts)
				}
			})
		} catch (err) {
			toastr.error('An error occurred while capturing the screenshot!', false, toastrOpts)
		}
	}, [])

	const captureScreen = useMemo(() => (
		screenshot ? captureScreenshot : startRecording
	), [screenshot, timer])

	const getRecordSources = useCallback(async () => {
		let recordSourceList = []

		try {
			recordSourceList = await interop.getRecordSources()
		} catch (err) {
			return toastr.error('The screen recorder will not work.', 'Unable to load record sources!', toastrOpts)
		}

		if (!recordSourceList.length) return false

		if (recordSourceList.length === 1) {
			return captureScreen(recordSourceList[0].id)
		}

		setRecordSources(recordSourceList)
	}, [])

	const toggleRecording = useCallback(() => {
		if (recording) {
			interop.stopRecording()
		} else {
			getRecordSources()
		}
	}, [recording])

	const toggleScreenshot = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])

	const ref = useRef()

	const modeMessage = `...or ${screenshot ? 'take a screenshot' : 'start a screen record'}`
	
	return (
		<div id="screen-recorder">
			<p>{recording ? 'Recording' : modeMessage}</p>
			<div>
				<DurationPointer />
				<button
					type="button"
					name="record"
					ref={ref}
					title={`${recording ? 'Stop' : 'Start'} Record`}
					className={recording ? 'recording' : ''}
					onClick={e => toggleRecording(e)}></button>
				<button
					type="button"
					name="screenshot"
					title={`Switch to Screen${screenshot ? ' Record' : 'shot'} Mode`}
					onClick={toggleScreenshot}
					disabled={recording}>
					<CaptureModeSwitch
						screenshot={screenshot}
						fill={recording ? '#ccc' : '#4c4c4c'} />
				</button>
			</div>
			{!!recordSources.length && (
				<RecordSourceSelector
					recordButton={ref.current}
					closeRecordSources={() => setRecordSources([])}
					recordSources={recordSources}
					captureScreen={captureScreen} />
			)}
			<ScreenRecorderTimer
				timer={timer}
				timerEnabled={timerEnabled}
				recording={recording}
				screenshot={screenshot}
				dispatch={dispatch} />
			{interop.isMac && <SoundflowerMessage />}
		</div>
	)
}

ScreenRecorder.propTypes = {
	recording: bool.isRequired,
	screenshot: bool.isRequired,
	timer: number.isRequired,
	timerEnabled: bool.isRequired,
	dispatch: func.isRequired
}

export default ScreenRecorder
