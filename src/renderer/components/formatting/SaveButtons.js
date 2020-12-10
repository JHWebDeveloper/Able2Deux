import React from 'react'
import { withRouter } from 'react-router-dom'
import { func, object } from 'prop-types'

const SaveButtons = ({ setRendering, history }) => (
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
)

SaveButtons.propTypes = {
	setRendering: func.isRequired,
	history: object.isRequired
}

export default withRouter(SaveButtons)
