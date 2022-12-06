import React from 'react'
import { arrayOf, element, func, bool, oneOfType, shape, string } from 'prop-types'

import DropdownMenu from './DropdownMenu'

const DetailsWrapper = ({ summary, id = '', className = '', open, buttons = [], children }) => (
	<details open={open}>
		<summary>
			{summary}
		</summary>
		{buttons.length ? <DropdownMenu buttons={buttons} /> : <></>}
		<div id={id} className={className}>
			{children}
		</div>
	</details>
)

DetailsWrapper.propTypes = {
	summary: string.isRequired,
	id: string,
	className: string,
	open: bool,
	buttons: arrayOf(shape({
		role: string,
		label: string,
		hide: bool,
		action: func
	})),
	children: oneOfType([element, arrayOf(oneOfType([bool, element]))])
}

export default DetailsWrapper
