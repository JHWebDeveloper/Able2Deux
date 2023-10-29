import React, { useCallback } from 'react'
import { exact, func, string } from 'prop-types'

import { updateScratchDisk } from 'actions'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = ({ scratchDisk, dispatch }) => {
	const dispatchUpdateScratchDisk = useCallback(property => value => {
		dispatch(updateScratchDisk({
			[property]: value
		}))
	}, [])

	const updateImports = useCallback(dispatchUpdateScratchDisk('imports'), [])
	const updateExports = useCallback(dispatchUpdateScratchDisk('exports'), [])
	const updatePreview = useCallback(dispatchUpdateScratchDisk('previews'), [])

	return (
		<FieldsetWrapper
			label="Scratch Disks"
			className="scratch-disks">
			<label>
				<span>Import Cache</span>
				<DirectorySelector
					directory={scratchDisk.imports}
					onChange={updateImports} />
			</label>
			<label>
				<span>Export Cache</span>
				<DirectorySelector
					directory={scratchDisk.exports}
					onChange={updateExports} />
			</label>
			<label>
				<span>Preview Cache</span>
				<DirectorySelector
					directory={scratchDisk.previews}
					onChange={updatePreview} />
			</label>
		</FieldsetWrapper>
	)
}

ScratchDisk.propTypes = {
	scratchDisk: exact({
		imports: string,
		previews: string,
		exports: string
	}).isRequired,
	dispatch: func.isRequired
}

export default ScratchDisk
