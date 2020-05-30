import React from 'react'

import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = ({ scratchDisk }) => {
	return (
		<div id="scratch-disk">
			<fieldset>
				<legend>Scratch Disk</legend>
				<div>
					<label>Import Cache</label>
					<DirectorySelector
						directory={scratchDisk.imports} />
					<label>Export Cache</label>
					<DirectorySelector
						directory={scratchDisk.exports}  />
					<label>Preview Cache</label>
					<DirectorySelector
						directory={scratchDisk.previews}  />
				</div>
			</fieldset>
		</div>
	)
}

export default ScratchDisk
