import React from 'react'

import { withRouter } from 'react-router-dom'

const SaveButtons = withRouter(({ setRendering, history }) => (
	<div id="save">
		<button
			type="button"
			className="app-button"
			title="Back"
			onClick={() => history.push('/')}>Back</button>
		<button
			type="button"
			className="app-button"
			title="Save"
			onClick={() => setRendering(true)}>Save</button>
	</div>
))

export default SaveButtons
