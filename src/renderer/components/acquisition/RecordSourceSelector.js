import React, { useCallback, useEffect, useRef, useState } from 'react'
import { array, func, object } from 'prop-types'

import { detectTabExit } from 'utilities'

const RecordSourceSelector = ({ recordButton, recordSources, closeRecordSources, captureScreen }) => {
	const [ visible, reveal ] = useState(false)

	const ref = useRef()

	const close = useCallback(recordSrcId => {
		reveal(false)

		ref.current.className = 'close'

		recordButton.focus()

		setTimeout(() => {
			closeRecordSources()
			if (recordSrcId) captureScreen(recordSrcId)
		}, 250)
	}, [])

	const closeSelectorOnBlur = useCallback(detectTabExit(close), [])

	useEffect(() => {
		setTimeout(() => reveal(true), 500)
	}, [])

	const getRecordButtonPos = useCallback(() => ({
		bottom: `${window.innerHeight - recordButton.getBoundingClientRect().bottom}px`
	}), [])

	return (
		<div
			id="record-source-selector"
			ref={ref}
			onBlur={closeSelectorOnBlur}>
			<div style={getRecordButtonPos()}>
				{visible ? <>
					<h2>
						Select Screen or Window
						<button
							type="button"
							className="symbol"
							title="close"
							onClick={() => close(false)}
							autoFocus>close</button>
					</h2>
					{recordSources.map(({ id, name, thumbnail }) => (
						<button
							key={id}
							type="button"
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
