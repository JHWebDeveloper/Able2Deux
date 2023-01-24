import React, { cloneElement, useCallback, useEffect, useState } from 'react'
import { arrayOf, element, func, bool, oneOfType, shape, string } from 'prop-types'

import DropdownMenu from './DropdownMenu'
import MediaOptionButtons from './MediaOptionButtons'

const AccordionPanel = ({ heading, id, className = '', initOpen, buttons = [], children }) => {
	const [ open, setOpen ] = useState(false)
	const headingId = `${id}-heading`

	const toggleOpen = useCallback(() => {
		setOpen(!open)
	}, [open])

	useEffect(() => {
		if (initOpen) setOpen(true)
	}, [])

	return (
		<section className={`formatting-panel accordion${open ? ' open' : ''}`}>
			<h2>
				<button
					type="button"
					title={`${open ? 'Close' : 'Open'} ${heading}`}
					id={headingId}
					onClick={toggleOpen}
					aria-expanded={open}
					aria-controls={id}>
					<span aria-hidden>keyboard_arrow_{open ? 'down' : 'right'}</span>
					{heading}
				</button>
				{buttons.length && open ? (
					<DropdownMenu>
						<MediaOptionButtons buttons={buttons} />
					</DropdownMenu>
				) : <></>}
			</h2>
			{open ? (
				<div
					id={id}
					className={className}
					role="region"
					aria-labelledby={headingId}>
					{open ? cloneElement(children) : <></>}
				</div>
			) : <></>}
		</section>
	)
}

AccordionPanel.propTypes = {
	heading: string.isRequired,
	id: string.isRequired,
	className: string,
	initOpen: bool,
	buttons: arrayOf(shape({
		role: string,
		label: string,
		hide: bool,
		action: func
	})),
	children: oneOfType([element, arrayOf(element)])
}

export default AccordionPanel
