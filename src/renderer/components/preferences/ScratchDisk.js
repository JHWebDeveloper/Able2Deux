import React, { useCallback } from 'react'
import { exact, func, string } from 'prop-types'

import { updateNestedState } from 'actions'

import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = ({ scratchDisk, dispatch }) => {
	const updateScratchDisk = useCallback((property, value) => {
		dispatch(updateNestedState('scratchDisk', {
			[property]: value
		}))
	})

	return (
		<div id="scratch-disk">
			<fieldset>
				<legend>Scratch Disk</legend>
				<div>
					<label>Import Cache</label>
					<DirectorySelector
						directory={scratchDisk.imports}
						onChange={dir => updateScratchDisk('imports', dir)} />
					<label>Export Cache</label>
					<DirectorySelector
						directory={scratchDisk.exports}
						onChange={dir => updateScratchDisk('exports', dir)} />
					<label>Preview Cache</label>
					<DirectorySelector
						directory={scratchDisk.previews}
						onChange={dir => updateScratchDisk('previews', dir)} />
				</div>
			</fieldset>
		</div>
	)
}

ScratchDisk.propTypes = {
	scratchDisk: exact({
		imports: string,
		exports: string,
		previews: string
	}).isRequired,
	dispatch: func.isRequired
}

export default ScratchDisk
