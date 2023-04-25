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

const Uploader = ({ dispatch }) => {
	const prepFilesForUpload = useCallback(files => {
		const _pipe = pipeAsync(upload, dispatch)

		for (const file of files) _pipe(file)
	}, [])

	const openFiles = useCallback(async () => {
		prepFilesForUpload(await window.ABLE2.interop.openFiles())
	}, [])

	const dropFiles = useCallback(e => {
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
	dispatch: func.isRequired
}

export default Uploader
