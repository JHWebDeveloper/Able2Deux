import React, { useCallback } from 'react'
import { func, object } from 'prop-types'

import { fixLocationsAndSavePrefs, restoreDefaultPrefs } from 'actions'
import { warn } from 'utilities'

const { interop } = window.ABLE2

const SaveAndClose = ({ prefs, dispatch }) => {
	const restoreDefaultPrefsWarning = useCallback(() => {
		warn({
			enabled: true,
			message: 'Restore Default Preferences?',
			detail: 'Once saved, this cannot be undone. Proceed?',
			callback: () => dispatch(restoreDefaultPrefs())
		})
	}, [])

	return (
		<div id="save-prefs">
			<button
				type="button"
				className="app-button"
				title="Save and Close"
				onClick={() => {
					dispatch(fixLocationsAndSavePrefs(prefs, true))
				}}>Save &amp; Close</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				onClick={() => {
					dispatch(fixLocationsAndSavePrefs(prefs))
				}}>Save</button>
			<button
				type="button"
				className="app-button"
				title="Close"
				onClick={interop.closeCurrentWindow}>Close</button>
			<button
				type="button"
				className="app-button"
				title="Restore Default"
				style={{ float: 'right' }}
				onClick={restoreDefaultPrefsWarning}>Restore Default</button>
		</div>
	)
}

SaveAndClose.propTypes = {
	prefs: object.isRequired,
	dispatch: func.isRequired
}

export default SaveAndClose
