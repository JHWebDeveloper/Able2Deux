import React, { useCallback, useEffect, useState } from 'react'
import toastr from 'toastr'
import { bool, func, number, shape, string } from 'prop-types'

import { updateNestedState, toggleNestedCheckbox } from '../../actions'
import { setRecording, saveScreenRecording } from '../../actions/acquisition'
import { toastrOpts } from '../../utilities'

import RecordSourceSelector from './RecordSourceSelector'
import Timecode from '../form_elements/Timecode'

const { interop } = window.ABLE2

let recorder = false
let timeout = false

const clearRecorder = () => {
	recorder = false
	clearTimeout(timeout)
}

const getStream = chromeMediaSourceId => navigator.mediaDevices.getUserMedia({
	audio: process.platform === 'darwin' ? false : {
		mandatory: {
			chromeMediaSource: 'desktop',
			chromeMediaSourceId
		}
	},
	video: {
		mandatory: {
			chromeMediaSource: 'desktop',
			chromeMediaSourceId,
			minFrameRate: 60,
			maxFrameRate: 60
		}
	}
})

const handleStream = (stream, timer, dispatch) => new Promise((resolve, reject) => {
	const blobs = []

	recorder = new MediaRecorder(stream)

	recorder.onstart = () => {
		dispatch(setRecording(true))

		if (timer.enabled) {
			timeout = setTimeout(() => {
				recorder.stop()
				interop.bringToFront()
			}, timer.tc * 1000)
		}
	}

	recorder.ondataavailable = e => {
		blobs.push(e.data)
	}

	recorder.onerror = err => {
		clearRecorder()
		reject(err)
	}

	recorder.onstop = () => {
		clearRecorder()
		dispatch(setRecording(false))
		resolve(blobs)
	}

	requestAnimationFrame(() => {
		recorder.start()
	})
})

const getBuffer = blob => new Promise((resolve, reject) => {
	const fileReader = new FileReader()

	fileReader.onload = () => {
		const buffer = Buffer.alloc(fileReader.result.byteLength)
		const arr = new Uint8Array(fileReader.result)
	
		for (let i = 0, l = arr.byteLength; i < l; i++) {
			buffer[i] = arr[i]
		}

		resolve(buffer)
	}

	fileReader.onerror = reject
	fileReader.readAsArrayBuffer(blob)
})

const ScreenRecorder = ({ recording, timer, dispatch }) => {
	const [ recordSourceData, loadRecordSourceData ] = useState(false)

	const startRecording = useCallback(async id => {
		try {
			const stream = await getStream(id)
			const blobs  = await handleStream(stream, timer, dispatch)
			const buffer = await getBuffer(new Blob(blobs, { type: 'video/mp4' }))
	
			dispatch(saveScreenRecording(buffer))
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
			recorder.stop()
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
