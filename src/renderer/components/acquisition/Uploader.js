import React, { useCallback } from 'react'
import { func } from 'prop-types'

import { upload } from 'actions'

const { interop } = window.ABLE2

const dragEnter = e => {
	e.target.parentElement.classList.add('drag-enter')
}

const dragLeave = e => {
	e.target.parentElement.classList.remove('drag-enter')
}

const Uploader = ({ dispatch }) => {
	const prepFilesForUpload = useCallback(e => {
		const files = Array.from(e.dataTransfer.files)

		for (const file of files) dispatch(upload(file))

		dragLeave(e)
	}, [])

	return (
		<div id="uploader">
			<p>...or drag and drop file(s) here</p>
			<div
				tabIndex="0"
				aria-label="Select Files to Upload"
				onClick={interop.openFiles}
				onDragOver={e => e.preventDefault()}
				onDragEnter={dragEnter}
				onDragLeave={dragLeave}
				onDrop={prepFilesForUpload}></div>
		</div>
	)
}

Uploader.propTypes = {
	dispatch: func.isRequired
}

export default Uploader
