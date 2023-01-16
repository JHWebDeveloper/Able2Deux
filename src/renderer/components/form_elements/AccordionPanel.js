import React, { cloneElement, useCallback, useEffect, useState } from 'react'
import { arrayOf, element, func, bool, oneOfType, shape, string } from 'prop-types'

import DropdownMenu from './DropdownMenu'
import MediaOptionButtons from './MediaOptionButtons'

const DetailsWrapper = ({ heading, id, className = '', initOpen, buttons = [], children }) => {
	const [ open, setOpen ] = useState(false)

	const toggleOpen = useCallback(() => {
		setOpen(!open)
	}, [open])

	useEffect(() => {
		if (initOpen) setOpen(true)
	}, [])

	return (
		<section className={`accordion-panel${open ? ' open' : ''}`}>
			<header>
				<h2>
					<span aria-hidden="true">keyboard_arrow_{open ? 'down' : 'right'}</span>
					{heading}
				</h2>
				<button
					type="button"
					title={`${open ? 'Close' : 'Open'} ${heading}`}
					onClick={toggleOpen}
					aria-expanded={open}
					aria-controls={id}></button>
				{open && buttons.length ? (
					<DropdownMenu>
						<MediaOptionButtons buttons={buttons} />
					</DropdownMenu>
				) : <></>}
			</header>
			{open ? (
				<div id={id} className={className}>
					{open ? cloneElement(children) : <></>}
				</div>
			) : <></>}
		</section>
	)
}

DetailsWrapper.propTypes = {
	heading: string.isRequired,
	id: string.isRequired,
	className: string,
	open: bool,
	buttons: arrayOf(shape({
		role: string,
		label: string,
		hide: bool,
		action: func
	})),
	children: oneOfType([element, arrayOf(element)])
}

export default DetailsWrapper
