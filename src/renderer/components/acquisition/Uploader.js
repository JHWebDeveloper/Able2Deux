import React, { useCallback } from 'react'
import { func } from 'prop-types'

import { upload } from 'actions'
import { pipeAsync } from 'utilities'

const dragEnter = e => {
	e.target.parentElement.classList.add('drag-enter')
}

const dragLeave = e => {
	e.target.parentElement.classList.remove('drag-enter')
}

const { interop } = window.ABLE2

const Uploader = ({ importQueueDispatch }) => {
	const prepFilesForUpload = useCallback(files => {
		const _pipe = pipeAsync(upload, importQueueDispatch)

		for (const file of files) _pipe(file)
	}, [])

	const openFiles = useCallback(async () => {
		prepFilesForUpload(await interop.openFiles())
	}, [])

	const dropFiles = useCallback(e => {
		e.preventDefault()
		prepFilesForUpload(Array.from(e.dataTransfer.files))
		dragLeave(e)
	}, [])

	return (
		<div id="uploader">
			<p>...or drag and drop file(s) here</p>
			<div
				tabIndex="0"
				role="button"
				aria-label="Select Files to Upload"
				onClick={openFiles}
				onDragOver={e => e.preventDefault()}
				onDragEnter={dragEnter}
				onDragLeave={dragLeave}
				onDrop={dropFiles}></div>
		</div>
	)
}

Uploader.propTypes = {
	importQueueDispatch: func.isRequired
}

export default Uploader
