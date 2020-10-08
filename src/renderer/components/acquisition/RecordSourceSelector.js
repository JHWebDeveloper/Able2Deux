import React, { useCallback, useEffect, useRef, useState } from 'react'
import { array, func, number } from 'prop-types'

import { detectTabExit } from '../../utilities'

const RecordSourceSelector = ({ selectMenuPos, recordSources, loadRecordSourceData, captureScreen }) => {
	const [ visible, reveal ] = useState(false)

	const ref = useRef()

	const close = useCallback(recordSrcId => {
		reveal(false)

		ref.current.className = 'close'

		setTimeout(() => {
			loadRecordSourceData(false)
			if (recordSrcId) captureScreen(recordSrcId)
		}, 250)
	}, [])

	const closeSelectorOnBlur = useCallback(detectTabExit(close), [])

	useEffect(() => {
		setTimeout(() => reveal(true), 500)
	}, [])

	return (
		<div
			id="record-source-selector"
			ref={ref}
			onBlur={closeSelectorOnBlur}>
			<div style={{ bottom: `${selectMenuPos}px` }}>
				{visible && <>
					<h2>
						Select Screen or Window
						<button
							type="button"
							className="symbol"
							title="close"
							onClick={close}
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
				</>}
			</div>
		</div>
	)
}

RecordSourceSelector.propTypes = {
	selectMenuPos: number.isRequired,
	recordSources: array.isRequired,
	loadRecordSourceData: func.isRequired,
	captureScreen: func.isRequired
}

export default RecordSourceSelector
