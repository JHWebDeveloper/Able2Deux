import React, { useCallback } from 'react'
import { exact, func, string } from 'prop-types'
import toastr from 'toastr'

import { updateScratchDisk } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { useWarning } from 'hooks'
import { errorToString } from 'utilities'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import DirectorySelector from '../form_elements/DirectorySelector'
import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const ScratchDisk = ({ scratchDisk, dispatch }) => {
	const dispatchUpdateScratchDisk = useCallback(property => value => {
		dispatch(updateScratchDisk({
			[property]: value
		}))
	}, [])

	const updateImports = useCallback(dispatchUpdateScratchDisk('imports'), [])
	const updateExports = useCallback(dispatchUpdateScratchDisk('exports'), [])
	const updatePreview = useCallback(dispatchUpdateScratchDisk('previews'), [])

	const clearScratchDisks = useCallback(async () => {
		try {
			await interop.clearScratchDisks()
			toastr.success('Scratch disks were cleared successfully.', false, TOASTR_OPTIONS)
		} catch (err) {
			toastr.error(errorToString(err), false, TOASTR_OPTIONS)
		}
	}, [])

	const warnClearScratchDisks = useWarning({
		message: 'Clear All Scratch Disks?',
		detail: 'This will delete all files in the Import, Preview and Export scratch disk directories. All media currently in loaded Able2 will be removed. This cannot be undone. Proceed?',
		onConfirm: clearScratchDisks,
		hasCheckbox: false
	})

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
			<ButtonWithIcon
				label="Clear Scratch Disks"
				name="clearScratchDisks"
				icon="cached"
				onClick={() => warnClearScratchDisks()} />
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
