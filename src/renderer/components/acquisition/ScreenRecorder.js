import React, { useCallback, useMemo, useRef, useState } from 'react'
import toastr from 'toastr'
import { bool, func, number, shape, string } from 'prop-types'

import * as STATUS from 'status'

import {
	updateNestedState,
	toggleCheckbox,
	toggleNestedCheckbox,
	setRecording,
	loadRecording,
	updateMediaStatus
} from '../../actions'

import { toastrOpts } from '../../utilities'

import RecordSourceSelector from './RecordSourceSelector'
import SoundflowerMessage from './SoundflowerMessage'
import Timer from './Timer'
import Timecode from '../form_elements/Timecode'
import DurationPointer from '../svg/DurationPointer'
import CaptureModeSwitch from '../svg/CaptureModeSwitch'

const { interop } = window.ABLE2

const ScreenRecorder = ({ recording, screenshot, timer, dispatch }) => {
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

		recordSourceList = recordSourceList.filter(({ name }) => name !== 'Able2Deux')

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
					disabled={recording}
					title={`Switch to Screen${screenshot ? ' Record' : 'shot'} Mode`}
					onClick={e => { dispatch(toggleCheckbox(e))}}>
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
			{recording ? ( // eslint-disable-line no-extra-parens
				<Timer start={timer.tc} decrement={timer.enabled} />
			) : (
				<Timecode
					name="timer"
					enabled={timer.enabled}
					display={timer.display}
					disabled={recording || screenshot}
					toggleTimecode={e => dispatch(toggleNestedCheckbox('timer', e))}
					onChange={tc => dispatch(updateNestedState('timer', tc))}
					invalid={timer.tc === 0}
					title="Set record duration" />
			)}
			{interop.isMac && <SoundflowerMessage />}
		</div>
	)
}

ScreenRecorder.propTypes = {
	recording: bool.isRequired,
	screenshot: bool.isRequired,
	timer: shape({
		enabled: bool.isRequired,
		tc: number.isRequired,
		display: string.isRequired
	}).isRequired,
	dispatch: func.isRequired
}

export default ScreenRecorder
