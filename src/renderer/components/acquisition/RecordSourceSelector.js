import React, { useCallback, useEffect, useRef, useState } from 'react'
import { array, func, number } from 'prop-types'

const RecordSourceSelector = ({ selectMenuPos, recordSources, loadRecordSourceData, selectedAction }) => {
	const [ visible, reveal ] = useState(false)

	const ref = useRef()

	const close = useCallback(recordSrcId => {
		reveal(false)

		ref.current.className = 'close'

		setTimeout(() => {
			loadRecordSourceData(false)
			if (recordSrcId) selectedAction(recordSrcId)
		}, 250)
	}, [])

	const closeOnBlur = useCallback(e => {
		if (!ref.current.contains(e.relatedTarget)) close()
	}, [])

	useEffect(() => {
		setTimeout(() => reveal(true), 500)
	}, [])

	return (
		<div
			id="record-source-selector"
			ref={ref}
			onBlur={closeOnBlur}>
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
	selectedAction: func.isRequired
}

export default RecordSourceSelector
