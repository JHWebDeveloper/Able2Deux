import React from 'react'
import { bool, func } from 'prop-types'

import { toggleCheckbox } from 'actions'

import Checkbox from '../../form_elements/Checkbox'

const EditAll = ({ editAll, dispatch }) => (
	<div>
		<Checkbox
			label="Edit All"
			name="editAll"
			checked={editAll}
			onChange={e => dispatch(toggleCheckbox(e))}
			switchIcon />
	</div>
)

EditAll.propTypes = {
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default EditAll
