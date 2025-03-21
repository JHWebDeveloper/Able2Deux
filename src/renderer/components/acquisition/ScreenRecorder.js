import React, { useCallback, useMemo, useRef, useState } from 'react'
import { bool, func, number } from 'prop-types'
import toastr from 'toastr'

import { STATUS } from 'constants'

import {
	loadRecording,
	toggleCheckbox,
	updateMediaStatus
} from 'actions'

import { TOASTR_OPTIONS } from 'constants'
import { errorToString } from 'utilities'

import RecordSourceSelector from './RecordSourceSelector'
import ScreenRecorderTimer from './ScreenRecorderTimer'
import BlackHoleMessage from './BlackHoleMessage'
import DurationPointer from '../svg/DurationPointer'
import CaptureModeSwitch from '../svg/CaptureModeSwitch'

const { interop } = window.ABLE2

const ScreenRecorder = ({ recording, setRecording, frameRate, screenshot, timer, timerEnabled, dispatch }) => {
	const [ recordSources, setRecordSources ] = useState([])
	const recordButton = useRef(null)

	const recordButtonTitle = `${recording ? 'Stop' : 'Start'} Record`
	const recordModeTitle = `Switch to Screen${screenshot ? ' Record' : 'shot'} Mode`

	const modeMessage = useMemo(() => {
		if (recording) {
			return 'Recording'
		} else if (screenshot) {
			return '...or take a screenshot'
		} else {
			return '...or start a screen record'
		}
	}, [recording, screenshot])

	const startRecording = useCallback(streamId => {
		const importStarted = new Date()

		interop.startRecording({
			streamId,
			frameRate,
			timer: timerEnabled && timer,
			setRecordIndicator: setRecording,
			onStart(recordId) {
				dispatch(loadRecording(recordId))
			},
			onComplete(recordId, mediaData) {
				dispatch(updateMediaStatus(recordId, STATUS.READY, {
					...mediaData,
					importStarted
				}))
			},
			onError(err, recordId) {
				if (recordId) dispatch(updateMediaStatus(recordId, STATUS.FAILED))

				toastr.error(errorToString(err), false, TOASTR_OPTIONS)
			}
		})
	}, [frameRate, timer, timerEnabled])

	const captureScreenshot = useCallback(streamId => {
		const importStarted = new Date()

		interop.captureScreenshot({
			streamId,
			frameRate,
			async onCapture(recordId, mediaData) {
				await dispatch(loadRecording(recordId, true))
				dispatch(updateMediaStatus(recordId, STATUS.READY, {
					...mediaData,
					importStarted
				}))
			},
			onError(err, recordId) {
				if (recordId) dispatch(updateMediaStatus(recordId, STATUS.FAILED))

				toastr.error(errorToString(err), false, TOASTR_OPTIONS)
			}
		})
	}, [frameRate])

	const captureScreen = useMemo(() => (
		screenshot ? captureScreenshot : startRecording
	), [screenshot, frameRate, timer, timerEnabled])

	const getRecordSources = useCallback(async () => {
		let recordSourceList = []

		try {
			recordSourceList = await interop.getRecordSources()
		} catch (err) {
			return toastr.error(errorToString(err), TOASTR_OPTIONS)
		}

		if (!recordSourceList.length) return false

		if (recordSourceList.length === 1) {
			return captureScreen(recordSourceList[0].id)
		}

		setRecordSources(recordSourceList)
	}, [screenshot, frameRate, timer, timerEnabled])

	const toggleRecording = useCallback(() => {
		if (recording) {
			interop.stopRecording()
		} else {
			getRecordSources()
		}
	}, [recording, screenshot, frameRate, timer, timerEnabled])

	const toggleScreenshot = useCallback(e => {
		dispatch(toggleCheckbox(e))
	}, [])
	
	return (
		<div id="screen-recorder">
			<p>{modeMessage}</p>
			<div>
				<DurationPointer />
				<button
					type="button"
					name="record"
					ref={recordButton}
					title={recordButtonTitle}
					aria-label={recordButtonTitle}
					onClick={toggleRecording}></button>
				<button
					type="button"
					name="screenshot"
					title={recordModeTitle}
					aria-label={recordModeTitle}
					onClick={toggleScreenshot}
					disabled={recording}>
					<CaptureModeSwitch
						screenshot={screenshot}
						disabled={recording} />
				</button>
			</div>
			{recordSources.length ? (
				<RecordSourceSelector
					recordButton={recordButton.current}
					closeRecordSources={() => setRecordSources([])}
					recordSources={recordSources}
					captureScreen={captureScreen} />
			) : <></>}
			<ScreenRecorderTimer
				timer={timer}
				timerEnabled={timerEnabled}
				recording={recording}
				recordButton={recordButton}
				screenshot={screenshot}
				dispatch={dispatch} />
			{interop.IS_MAC ? <BlackHoleMessage /> : <></>}
		</div>
	)
}

ScreenRecorder.propTypes = {
	recording: bool.isRequired,
	setRecording: func.isRequired,
	frameRate: number.isRequired,
	screenshot: bool.isRequired,
	timer: number.isRequired,
	timerEnabled: bool.isRequired,
	dispatch: func.isRequired
}

export default ScreenRecorder
