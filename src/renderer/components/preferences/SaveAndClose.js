import React from 'react'

import { savePrefs } from '../../actions/preferences'

const { interop } = window.ABLE2

const SaveAndClose = ({ prefs, dispatch }) => (
	<div id="save-prefs">
		<button
			type="button"
			className="app-button"
			title="Save"
			onClick={() => dispatch(savePrefs(prefs))}>Save</button>
		<button
			type="button"
			className="app-button"
			title="Close"
			onClick={interop.closeCurrentWindow}>Close</button>
	</div>
)

export default SaveAndClose
