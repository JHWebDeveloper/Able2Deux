import React, { cloneElement } from 'react'
import { arrayOf, element, func, bool, oneOfType, shape, string } from 'prop-types'

import { usePanelToggle } from 'hooks'
import { classNameBuilder } from 'utilities'

import PopupMenu from './PopupMenu'

const AccordionPanel = ({ heading, id, className = '', options = [], children }) => {
	const [ open, togglePanelOpen ] = usePanelToggle(id)
	const headingId = `${id}-heading`
	const title = `${open ? 'Close' : 'Open'} ${heading}`
	
	return (
		<section className={classNameBuilder({
			'panel': true,
			accordion: true,
			open
		})}>
			<h2>
				<button
					type="button"
					title={title}
					id={headingId}
					onClick={togglePanelOpen}
					aria-label={title}
					aria-expanded={open}
					aria-controls={id}>
					<span aria-hidden>keyboard_arrow_{open ? 'down' : 'right'}</span>
					{heading}
				</button>
				{options.length && open ? (
					<PopupMenu
						alignment="bottom right"
						options={options} />
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
	options: arrayOf(shape({
		role: string,
		label: string,
		hide: bool,
		action: func
	})),
	children: oneOfType([element, arrayOf(element)])
}

export default AccordionPanel
