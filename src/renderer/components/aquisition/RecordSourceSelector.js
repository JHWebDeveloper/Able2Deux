import React, { useCallback, useEffect, useState } from 'react'

const { interop } = window.ABLE2

const RecordSourceSelector = ({ selectMenuPos, recordSources, loadRecordSourceData, startRecording }) => {
	const [ visible, reveal ] = useState(false)

	const close = useCallback(() => {
		reveal(false)
		document.querySelector('#record-source-selector').className = 'close'
	}, [])


	const recordAfterClose = useCallback(id => {
		close()
		setTimeout(() => {
			loadRecordSourceData(false)
			startRecording(id)
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
						Select Window to Record
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
							<img src={thumbnail.toDataURL()} />
							<span>{name}</span>
						</button>
					))}
				</>}
			</div>
		</div>
	)
}

export default RecordSourceSelector
