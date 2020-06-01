import React, { useCallback } from 'react'

const { interop } = window.ABLE2

const DirectorySelector = ({ directory, onChange }) => {
	const selectDirectory = useCallback(async () => {
		const { filePaths, canceled } = await interop.chooseDirectory()
		
		onChange(canceled ? directory : filePaths[0])
	}, [directory])
	
	return <>
		<button
			type="button"
			className="app-button symbol"
			title="Choose directory"
			onClick={selectDirectory}>folder</button>
		<input
			type="text"
			name="directory"
			title="Directory"
			value={directory}
			readOnly />
	</>
}

export default DirectorySelector
