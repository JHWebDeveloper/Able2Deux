import React, { useCallback } from 'react'
import { func } from 'prop-types'

import { cleanupPrefsAndSave, closePrefs, restoreDefaultPrefs } from 'actions'
import { useWarning, useSaveWarning } from 'hooks'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const SaveAndClose = ({ dispatch }) => {
	const restoreDefaultPrefsWarning = useWarning({
		message: 'Restore Default Preferences?',
		hasCheckbox: false,
		onConfirm() {
			dispatch(restoreDefaultPrefs())
		}
	})

	const savePrefs = useCallback(closePrefs => {
		dispatch(cleanupPrefsAndSave(closePrefs))
	}, [])

	const closeWithoutSaveWarning = useSaveWarning({
		detail: 'If you close preferences without saving, any changes you\'ve made will revert to their previously saved state. Proceed?',
		onConfirm() {
			interop.closePreferences()
		},
		onSave() {
			savePrefs()
		}
	})

	const checkUnsavedAndClosePrefs = useCallback(() => {
		dispatch(closePrefs(closeWithoutSaveWarning))
	}, [])

	return (
		<footer>
			<ButtonWithIcon
				label="Save & Close"
				icon="save"
				title="Save and Close"
				onClick={() => savePrefs(true)} />
			<ButtonWithIcon
				label="Save"
				icon="save"
				onClick={() => savePrefs()} />
			<ButtonWithIcon
				label="Close"
				icon="close"
				onClick={checkUnsavedAndClosePrefs} />
			<ButtonWithIcon
				label="Restore Default"
				icon="settings_backup_restore"
				onClick={restoreDefaultPrefsWarning} />
		</footer>
	)
}

SaveAndClose.propTypes = {
	dispatch: func.isRequired
}

export default SaveAndClose
