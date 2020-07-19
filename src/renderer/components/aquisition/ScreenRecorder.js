import React, { useCallback, useState } from 'react'
import toastr from 'toastr'
import { bool, func, number, shape, string } from 'prop-types'

import * as STATUS from '../../status/types'
import { updateNestedState, toggleNestedCheckbox } from '../../actions'
import { setRecording, loadRecording, updateMediaStatus } from '../../actions/acquisition'
import { toastrOpts } from '../../utilities'

import RecordSourceSelector from './RecordSourceSelector'
import Timecode from '../form_elements/Timecode'

const { interop } = window.ABLE2

const ScreenRecorder = ({ recording, timer, dispatch }) => {
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

	const getRecordSources = useCallback(async recordButton => {
		let recordSources = []

		try {
			recordSources = await interop.getRecordSources()
		} catch (err) {
			return toastr.error('The screen recorder will not work.', 'Unable to load record sources!', toastrOpts)
		}

		recordSources = recordSources.filter(({ name }) => name !== 'Able2Deux')

		if (recordSources.length === 1) {
			return startRecording(recordSources[0].id)
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
	
	return (
		<div id="screen-recorder">
			<p>{recording ? 'Recording' : '...or start a screen record'}</p>
			<button
				type="button"
				name="record"
				title={`${recording ? 'Stop' : 'Start'} Record`}
				className={recording ? 'recording' : ''}
				onClick={e => toggleRecording(e)}></button>
			{!!recordSourceData && (
				<RecordSourceSelector
					loadRecordSourceData={loadRecordSourceData}
					startRecording={startRecording}
					{...recordSourceData} />
			)}
			<Timecode
				name="timer"
				enabled={timer.enabled}
				display={timer.display}
				disabled={recording}
				toggleTimecode={e => dispatch(toggleNestedCheckbox('timer', e))}
				onChange={tc => dispatch(updateNestedState('timer', tc))} />
			{interop.isMac && <p>(Audio not supported on Mac)</p>}
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
