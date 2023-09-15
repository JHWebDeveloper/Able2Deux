import React, { useCallback } from 'react'
import { func, object } from 'prop-types'

import { cleanupPrefsAndSave, restoreDefaultPrefs } from 'actions'
import { useWarning, useSaveWarning } from 'hooks'
import { objectsAreEqual } from 'utilities'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const SaveAndClose = ({ preferences, dispatch }) => {
	const restoreDefaultPrefsWarning = useWarning({
		message: 'Restore Default Preferences?',
		detail: 'Once saved, this cannot be undone. Proceed?',
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
			savePrefs(true)
		}
	})

	const closePrefs = useCallback(async () => {
		closeWithoutSaveWarning({
			skip: objectsAreEqual(await interop.requestPrefs(), preferences)
		})
	}, [preferences])

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
				onClick={closePrefs} />
			<ButtonWithIcon
				label="Restore Default"
				icon="settings_backup_restore"
				onClick={() => restoreDefaultPrefsWarning()} />
		</footer>
	)
}

SaveAndClose.propTypes = {
	preferences: object.isRequired,
	dispatch: func.isRequired
}

export default SaveAndClose
