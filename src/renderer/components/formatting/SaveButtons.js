import React from 'react'
import { useNavigate } from 'react-router'
import { func } from 'prop-types'

const SaveButtons = ({ setRendering }) => {
	const navigate = useNavigate()
	
	return (
		<div id="save">
			<button
				type="button"
				className="app-button"
				title="Back"
				aria-label="Black"
				onClick={() => navigate('/')}>Back</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				aria-label="Save"
				onClick={() => setRendering(true)}>Save</button>
		</div>
	)
}

SaveButtons.propTypes = {
	setRendering: func.isRequired
}

export default SaveButtons
