import React, { cloneElement, useCallback, useId, useRef, useState } from 'react'
import { arrayOf, element, oneOfType, string } from 'prop-types'

import { useToggle } from 'hooks'
import { detectTabExit, isArrowNext, isArrowPrev } from 'utilities'

const getFocusableSibling = (el, prop) => {
	const sibling = el[prop]

	return sibling?.tabIndex === -1 ? getFocusableSibling(sibling, prop) : sibling
}

const DropdownMenu = ({ icon = 'more_vert', children }) => {
	const [ showMenu, toggleShowMenu ] = useToggle()
	const [ position, setPosition ] = useState({ top: 0, left: 0 })
	const toggleMenuButton = useRef(null)
	const menuRefId = useId()

	const getPositionRelativeToWindow = useCallback(e => {
		const { bottom, left } = e.target.getBoundingClientRect()

		setPosition({
			top: `${bottom + 3}px`,
			left: `${left}px`
		})

		toggleShowMenu()
	}, [])

	const closeMenuOnBlur = useCallback(detectTabExit(toggleShowMenu), [])

	const navigateWithKeys = useCallback(e => {
		if (e.key !== 'Tab') e.stopPropagation()
		
		if (e.key === 'Escape') {
			toggleShowMenu()
			toggleMenuButton.current.focus()
		} else if (isArrowPrev(e)) {
			getFocusableSibling(e.currentTarget, 'previousElementSibling')?.focus()
		} else if (isArrowNext(e)) {
			getFocusableSibling(e.currentTarget, 'nextElementSibling')?.focus()
		}
	}, [])

	return (
		<span className="dropdown" onBlur={closeMenuOnBlur}>
			<button
				ref={toggleMenuButton}
				type="button"
				title="Options"
				className="symbol"
				onClick={getPositionRelativeToWindow}
				aria-label="Options"
				aria-haspopup
				aria-expanded={showMenu}
				aria-controls={menuRefId}>{icon}</button>
			{showMenu ? (
				<span
					role="menu"
					aria-label="Options"
					id={menuRefId}
					style={position}>
					{cloneElement(children, { toggleMenu: toggleShowMenu, navigateWithKeys })}
				</span>
			) : <></>}
		</span>
	)
}

DropdownMenu.propTypes = {
	icon: string,
	children: oneOfType([element, arrayOf(element)])
}

export default DropdownMenu
