import React, { useCallback, useEffect, useRef, useState } from 'react'
import { array, func, object } from 'prop-types'

import { detectTabExit } from 'utilities'

const RecordSourceSelector = ({ recordButton, recordSources, closeRecordSources, captureScreen }) => {
	const [ visible, setVisible ] = useState(false)
	const recordSourceSelector = useRef(null)
	const setVisibleTimeout = useRef(null)

	const close = useCallback(recordSrcId => {
		setVisible(false)

		recordSourceSelector.current.className = 'close'

		recordButton.focus()

		setTimeout(() => {
			closeRecordSources()
			if (recordSrcId) captureScreen(recordSrcId)
		}, 250)
	}, [])

	const closeSelectorOnBlur = useCallback(detectTabExit(close), [])

	useEffect(() => {
		setVisibleTimeout.current = setTimeout(() => {
			setVisible(true)
		}, 500)

		return () => {
			clearTimeout(setVisibleTimeout.current)
		}
	}, [])

	const getRecordButtonPos = useCallback(() => ({
		bottom: `${window.innerHeight - recordButton.getBoundingClientRect().bottom}px`
	}), [])

	return (
		<div
			id="record-source-selector"
			ref={recordSourceSelector}
			onBlur={closeSelectorOnBlur}>
			<div style={getRecordButtonPos()}>
				{visible ? <>
					<h2>
						Select Screen or Window
						<button
							type="button"
							className="symbol"
							title="Close"
							aria-label="Close"
							onClick={() => close(false)}
							autoFocus>close</button>
					</h2>
					{recordSources.map(({ id, name, thumbnail }) => (
						<button
							key={id}
							type="button"
							title={`Record ${name}`}
							aria-label={`Record ${name}`}
							onClick={() => close(id)}>
							<img src={thumbnail} />
							<span>{name}</span>
						</button>
					))}
				</> : <></>}
			</div>
		</div>
	)
}

RecordSourceSelector.propTypes = {
	recordButton: object.isRequired,
	recordSources: array.isRequired,
	closeRecordSources: func.isRequired,
	captureScreen: func.isRequired
}

export default RecordSourceSelector
