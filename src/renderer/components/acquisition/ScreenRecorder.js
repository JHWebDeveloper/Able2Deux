import React, { useCallback, useMemo, useState } from 'react'
import toastr from 'toastr'
import { bool, func, number, shape, string } from 'prop-types'

import * as STATUS from '../../status/types'
import { updateNestedState, toggleCheckbox, toggleNestedCheckbox } from '../../actions'
import { setRecording, loadRecording, updateMediaStatus } from '../../actions/acquisition'
import { toastrOpts } from '../../utilities'

import RecordSourceSelector from './RecordSourceSelector'
import SoundflowerMessage from './SoundflowerMessage'
import Timecode from '../form_elements/Timecode'
import DurationPointer from '../svg/DurationPointer'
import CaptureModeSwitch from '../svg/CaptureModeSwitch'

const { interop } = window.ABLE2

const ScreenRecorder = ({ recording, screenshot, timer, dispatch }) => {
	const [ recordSourceData, loadRecordSourceData ] = useState(false)

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
				onError: recordId => {
					dispatch(updateMediaStatus(recordId, STATUS.FAILED))
					toastr.error('Error saving screen record', false, toastrOpts)
				}
			})
		} catch (err) {
			toastr.error('An error occurred during the screen record!', false, toastrOpts)
		}
	}, [timer])

	const captureScreenshot = useCallback(async (streamId) => {
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

	const selectedAction = useMemo(() => (
		screenshot ? captureScreenshot : startRecording
	), [screenshot, timer])

	const getRecordSources = useCallback(async recordButton => {
		let recordSources = []

		try {
			recordSources = await interop.getRecordSources()
		} catch (err) {
			return toastr.error('The screen recorder will not work.', 'Unable to load record sources!', toastrOpts)
		}

		recordSources = recordSources.filter(({ name }) => name !== 'Able2Deux')

		if (recordSources.length === 1) {
			return selectedAction(recordSources[0].id)
		}

		loadRecordSourceData({
			recordSources,
			selectMenuPos: window.innerHeight - recordButton.getBoundingClientRect().bottom
		})
	}, [])

	const toggleRecording = useCallback(e => {
		if (recording) {
			interop.stopRecording()
		} else {
			getRecordSources(e.currentTarget)
		}
	}, [recording])

	const modeMessage = `...or ${screenshot ? 'take a screenshot' : 'start a screen record'}`
	
	return (
		<div id="screen-recorder">
			<p>{recording ? 'Recording' : modeMessage}</p>
			<div>
				<DurationPointer />
				<button
					type="button"
					name="record"
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
						fill={recording ? '#ccc' : '#444'} />
				</button>
			</div>
			{!!recordSourceData && (
				<RecordSourceSelector
					loadRecordSourceData={loadRecordSourceData}
					selectedAction={selectedAction}
					{...recordSourceData} />
			)}
			<Timecode
				name="timer"
				enabled={timer.enabled}
				display={timer.display}
				disabled={recording || screenshot}
				toggleTimecode={e => dispatch(toggleNestedCheckbox('timer', e))}
				onChange={tc => dispatch(updateNestedState('timer', tc))} />
			{interop.isMac && <SoundflowerMessage />}
		</div>
	)
}

ScreenRecorder.propTypes = {
	recording: bool.isRequired,
	timer: shape({
		enabled: bool.isRequired,
		tc: number.isRequired,
		display: string.isRequired
	}).isRequired,
	dispatch: func.isRequired
}

export default ScreenRecorder
