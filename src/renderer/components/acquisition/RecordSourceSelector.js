import React, { useCallback, useEffect, useState } from 'react'
import { array, func, number } from 'prop-types'

const RecordSourceSelector = ({ selectMenuPos, recordSources, loadRecordSourceData, selectedAction }) => {
	const [ visible, reveal ] = useState(false)

	const close = useCallback(() => {
		reveal(false)
		document.querySelector('#record-source-selector').className = 'close'
	}, [])


	const recordAfterClose = useCallback(id => {
		close()
		setTimeout(() => {
			loadRecordSourceData(false)
			selectedAction(id)
		}, 250)
	}, [])

	const cancel = useCallback(() => {
		close()
		setTimeout(() => {
			loadRecordSourceData(false)
		}, 250)
	}, [])

	useEffect(() => {
		setTimeout(() => reveal(true), 500)
	}, [])

	return (
		<div
			id="record-source-selector"
			onClick={e => {
				if (e.target === e.currentTarget) cancel()
			}}>
			<div style={{ bottom: `${selectMenuPos}px` }}>
				{visible && <>
					<h2>
						Select Screen or Window
						<button
							type="button"
							className="symbol"
							title="close"
							onClick={cancel}>close</button>
					</h2>
					{recordSources.map(({ id, name, thumbnail }) => (
						<button
							key={id}
							type="button"
							onClick={() => recordAfterClose(id)}>
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
