import React, { useCallback } from 'react'
import { func } from 'prop-types'

import { upload } from 'actions'

const dragOver = e => {
	e.target.parentElement.classList.add('drag-enter')
}

const dragOut = e => {
	e.target.parentElement.classList.remove('drag-enter')
}

const Uploader = ({ dispatch }) => {
	const prepFilesForUpload = useCallback(e => {
		const files = Array.from(e.target.files)

		e.target.value = ''

		Promise.all(files.map(file => dispatch(upload(file))))
	}, [])

	return (
		<div id="uploader">
			<p>...or drag and drop file(s) here</p>
			<input
				type="file"
				onChange={prepFilesForUpload}
				onDragEnter={dragOver}
				onDragLeave={dragOut}
				onDrop={dragOut}
				multiple />
		</div>
	)
}

Uploader.propTypes = {
	dispatch: func.isRequired
}

export default Uploader
