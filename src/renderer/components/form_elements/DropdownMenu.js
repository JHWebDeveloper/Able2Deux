import React, { cloneElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { arrayOf, bool, element, func, object, oneOfType, shape, string } from 'prop-types'

import {
	detectTabExit,
	isArrowNext,
	isArrowPrev
} from 'utilities'

const getFocusableSibling = (el, prop) => {
	const sibling = el[prop]

	return sibling?.tabIndex === -1 ? getFocusableSibling(sibling, prop) : sibling
}

const stopPropagation = e => e.stopPropagation()

const toPx = val => `${val}px`

const DropdownMenu = ({
	submenu = false,
	alignment = 'left bottom',
	label = 'Options',
	icon,
	parentMenu,
	children
}) => {
	const [ showMenu, setShowMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })
	const menuButton = useRef(null)
	const menuId = useId()

	const getPositionRelativeToWindow = useCallback(e => {
		const { top, right, bottom, left }  = e.currentTarget.children[0].getBoundingClientRect()
		const { innerWidth, innerHeight } = window
		const style = {}

		switch (alignment) {
			case 'bottom left':
				style.top = toPx(bottom)
				style.left = toPx(left)
				break
			case 'bottom right':
				style.top = toPx(bottom)
				style.right = toPx(innerWidth - right)
				break
			case 'top left':
				style.bottom = toPx(innerHeight - top)
				style.left = toPx(left)
				break
			case 'top right':
				style.bottom = toPx(innerHeight - top)
				style.right = toPx(innerWidth - right)
				break
			case 'left top':
				style.top = toPx(top)
				style.right = toPx(innerWidth - left)
				break
			case 'left bottom':
				style.bottom = toPx(innerHeight - bottom)
				style.right = toPx(innerWidth - left)
				break
			case 'right top':
				style.top = toPx(top)
				style.left = toPx(right)
				break
			case 'right bottom':
				style.bottom = toPx(innerHeight - bottom)
				style.left = toPx(right)
				break
			default:
				style = {}
		}

		setPosition(style)
		setShowMenu(true)
	}, [])

	const closeCurrentMenu = useCallback(() => {
		setShowMenu(false)
	}, [showMenu])

	const toggleMenu = useCallback(e => {
		if (showMenu) {
			closeCurrentMenu()
		} else {
			getPositionRelativeToWindow(e)
		}
	}, [showMenu])

	const closeMenuOnBlur = useCallback(detectTabExit(closeCurrentMenu), [])

	const navigateWithKeys = useCallback(e => {
		if (e.key !== 'Tab' && e.key !== 'Escape') e.stopPropagation()

		if (isArrowPrev(e)) {
			getFocusableSibling(e.currentTarget, 'previousElementSibling')?.focus()
		} else if (isArrowNext(e)) {
			getFocusableSibling(e.currentTarget, 'nextElementSibling')?.focus()
		}
	}, [showMenu])

	const rootMenuOrSubmenuProps = useMemo(() => submenu ? {
		role: 'menuitem button',
		onClick: stopPropagation,
		onMouseEnter: getPositionRelativeToWindow,
		onMouseLeave() {
			closeCurrentMenu()
			menuButton.current.focus()
		},
		onKeyDown(e) {
			if (e.key === 'Enter') {
				e.preventDefault()
				e.stopPropagation()
				toggleMenu(e)
			} else {
				navigateWithKeys(e)
			}
		}
	} : {
		onClick: toggleMenu,
		onKeyDown(e) {
			if (e.key === 'Escape') {
				closeCurrentMenu()
				menuButton.current.focus()
			} else if (e.key === 'Enter') {
				e.preventDefault()
				toggleMenu(e)
			}
		}
	}, [showMenu])

	useEffect(() => {
		const shouldListen = showMenu && parentMenu?.current && menuButton?.current

		if (!shouldListen) return

		const closeOnParentMouseOver = e => {
			if (!menuButton.current.contains(e.target)) closeCurrentMenu()
		}

		parentMenu.current.addEventListener('mouseover', closeOnParentMouseOver)

		return () => {
			if (shouldListen) {
				parentMenu.current.removeEventListener('mouseover', closeOnParentMouseOver)
			}
		}
	}, [showMenu])

	return (
		<span
			ref={menuButton}
			tabIndex={0}
			className={submenu ? 'submenu' : 'dropdown'}
			role="button"
			title={label}
			aria-label={label}
			aria-haspopup
			aria-expanded={showMenu}
			aria-controls={menuId}
			onBlur={closeMenuOnBlur}
			{...rootMenuOrSubmenuProps}>
			<span className={`dropdown-button-label${icon ? ' symbol' : ''}`}>
				{icon || label}
				{submenu ? <span>chevron_right</span> : <></>}
			</span>
			{showMenu ? (
				<span
					className="dropdown-content"
					role="menu"
					aria-label="Options"
					id={menuId}
					style={position}
					{...submenu ? { onMouseLeave: stopPropagation } : {}}>
					{cloneElement(children, { navigateWithKeys, parentMenu: parentMenu || menuButton })}
				</span>
			) : <></>}
		</span>
	)
}

DropdownMenu.propTypes = {
	children: oneOfType([element, arrayOf(element)]),
	icon: string,
	label: string,
	parentMenu: oneOfType([
		func,
		shape({
			current: object
		})
	]),
	submenu: bool
}

export default DropdownMenu
