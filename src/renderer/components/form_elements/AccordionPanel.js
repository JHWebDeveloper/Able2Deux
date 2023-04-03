import React, { cloneElement, useEffect } from 'react'
import { arrayOf, element, func, bool, oneOfType, shape, string } from 'prop-types'

import { useToggle } from 'hooks'

import DropdownMenu from './DropdownMenu'
import MediaOptionButtons from './MediaOptionButtons'

const AccordionPanel = ({ heading, id, className = '', initOpen, buttons = [], children }) => {
	const [ open, toggleOpen ] = useToggle()
	const headingId = `${id}-heading`
	const title = `${open ? 'Close' : 'Open'} ${heading}`

	useEffect(() => {
		if (initOpen) toggleOpen(true)
	}, [])

	return (
		<section className={`formatting-panel accordion${open ? ' open' : ''}`}>
			<h2>
				<button
					type="button"
					title={title}
					id={headingId}
					onClick={toggleOpen}
					aria-label={title}
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
