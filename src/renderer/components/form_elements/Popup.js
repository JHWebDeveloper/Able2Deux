import React, { cloneElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { arrayOf, bool, element, func, object, oneOf, oneOfType, shape, string } from 'prop-types'

import {
	classNameBuilder,
	detectTabExit,
	isArrowNext,
	isArrowPrev,
	toPx
} from 'utilities'

const getFocusableSibling = (el, prop) => {
	const sibling = el[prop]

	return sibling?.tabIndex === -1 ? getFocusableSibling(sibling, prop) : sibling
}

const PopupContainer = ({ menuId, position, setPosition, submenu, children }) => {
	const container = useRef(null)

	useEffect(() => {
		const { top, height } = container.current.getBoundingClientRect()
		const { innerHeight } = window

		if (top + height > innerHeight) {
			setPosition(currentPosition => ({
				...currentPosition,
				top: toPx(innerHeight - height)
			}))
		}
	}, [])

	return (
		<span
			ref={container}
			className="popup-content"
			role="menu"
			aria-label="Options"
			id={menuId}
			style={position}
			{...submenu ? { onMouseLeave(e) { e.stopPropagation() } } : {}}>
			{ children }
		</span>
	)
}

const Popup = ({
	submenu = false,
	alignment = 'left bottom',
	label = 'Options',
	icon,
	parentMenu,
	autoFocus,
	children
}) => {
	const [ showMenu, setShowMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })
	const menuButton = useRef(null)
	const menuId = useId()

	const getPositionRelativeToWindow = useCallback(e => {
		const { top, right, bottom, left } = e.currentTarget.children[0].getBoundingClientRect()
		const { innerWidth, innerHeight } = window
		let style = {}

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

	const closeCurrentMenu = useCallback(refocus => {
		setShowMenu(false)
		if (refocus) menuButton.current.focus()
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
		onClick(e) {
			if (e.target === e.currentTarget) e.stopPropagation()
		},
		onMouseEnter: getPositionRelativeToWindow,
		onMouseLeave() {
			closeCurrentMenu(true)
		},
		onKeyDown(e) {
			if (showMenu && e.key === 'Escape') {
				e.stopPropagation()
				closeCurrentMenu(true)
			} else if (e.key === 'Escape') {
				closeCurrentMenu(true)
			} else if (e.key === 'Enter') {
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
				closeCurrentMenu(true)
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

	useEffect(() => {
		if (autoFocus) menuButton.current.focus()
	}, [])

	return (
		<span
			ref={menuButton}
			tabIndex={0}
			className={submenu ? 'submenu' : 'popup'}
			role="button"
			aria-label={label}
			aria-haspopup
			aria-expanded={showMenu}
			aria-controls={menuId}
			onBlur={closeMenuOnBlur}
			data-no-drag={showMenu}
			{...rootMenuOrSubmenuProps}>
			<span
				className={classNameBuilder({
					'popup-button-label': true,
					symbol: icon
				})}
				{...submenu ? {} : { title: label }}>
				{icon || label}
				{submenu ? <span>chevron_right</span> : <></>}
			</span>
			{showMenu ? (
				<PopupContainer
					menuId={menuId}
					position={position}
					setPosition={setPosition}
					submenu={submenu}>
					{cloneElement(children, { navigateWithKeys, parentMenu: parentMenu || menuButton })}
				</PopupContainer>
			) : <></>}
		</span>
	)
}

const sharedPropTypes = {
	submenu: bool,
	children: oneOfType([element, arrayOf(element)])
}

PopupContainer.propTypes = {
	...sharedPropTypes,
	menuId: string.isRequired,
	position: shape({
		top: string,
		right: string,
		bottom: string,
		left: string
	}).isRequired,
	setPosition: func.isRequired
}

Popup.propTypes = {
	...sharedPropTypes,
	icon: string,
	label: string,
	alignment: oneOf(['top left', 'top right', 'bottom left', 'bottom right', 'right top', 'right bottom', 'left top', 'left bottom']),
	autoFocus: bool,
	parentMenu: oneOfType([
		func,
		shape({
			current: object
		})
	])
}

export default Popup
