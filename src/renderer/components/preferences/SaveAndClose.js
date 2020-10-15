import React, { useCallback } from 'react'
import { func, object } from 'prop-types'

import { savePrefs, restoreDefaultPrefs } from 'actions'
import { warn } from 'utilities'

const { interop } = window.ABLE2

const SaveAndClose = ({ prefs, dispatch }) => {
	const restoreDefaultPrefsWithWarning = useCallback(() => {
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
				onClick={() => dispatch(savePrefs(prefs, true))}>Save &amp; Close</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				onClick={() => dispatch(savePrefs(prefs))}>Save</button>
			<button
				type="button"
				className="app-button"
				title="Close"
				onClick={() => interop.closeCurrentWindow()}>Close</button>
			<button
				type="button"
				className="app-button"
				title="Restore Default"
				style={{ float: 'right' }}
				onClick={restoreDefaultPrefsWithWarning}>Restore Default</button>
		</div>
	)
}

SaveAndClose.propTypes = {
	prefs: object.isRequired,
	dispatch: func.isRequired
}

export default SaveAndClose
