import React, { useId, useMemo } from 'react'
import { arrayOf, bool, func, object, oneOfType, shape, string } from 'prop-types'

import DropdownMenu from './DropdownMenu'

const MediaOptionButtons = ({ buttons, navigateWithKeys, parentMenu }) => {
	const menuId = useId()

	const enabledButtons = useMemo(() => (
		buttons
			.filter(({ hide }) => !hide)
			.filter(({ type }, i, arr) => !(type === 'spacer' && (arr[i - 1]?.type === 'spacer' || i === 0)))
	), [buttons])


	return enabledButtons.map((props, i) => {
		const { type, label, action, shortcut } = props
		
		if (type === 'spacer') {
			return (
				<span
					key={`${menuId}_${i}`}
					className="spacer"
					aria-hidden
					data-no-drag></span>
			)
		} else if ('submenu' in props) {
			return (
				<MediaOptionsDropdown
					key={`${menuId}_${i}`}
          buttons={props.submenu}
					alignment="right top"
					label={label}
					parentMenu={parentMenu}
					autoFocus={i === 0}
          submenu />
			)
		} else {
			return (
				<button
					key={`${menuId}_${i}`}
					type="button"
					role="menuitem"
					title={label}
					aria-label={label}
					autoFocus={i === 0}
					onClick={action}
					onKeyDown={navigateWithKeys}
					data-no-drag>
					<span>{label}</span>
					{shortcut ? <kbd>{shortcut}</kbd> : <></>}
				</button>
			)
		}
	})
}

const MediaOptionsDropdown = ({
	alignment = 'bottom left',
	icon = 'more_vert',
	label,
	buttons,
	submenu,
	parentMenu,
	autoFocus
}) => (
	<DropdownMenu
		alignment={alignment}
		label={label}
    submenu={submenu}
    parentMenu={parentMenu}
		autoFocus={autoFocus}
    {...submenu ? {} : { icon }}>
		<MediaOptionButtons buttons={buttons} />
	</DropdownMenu>
)

const parentMenuPropType = oneOfType([
	func,
	shape({
		current: object
	})
])

const buttonPropType = shape({
	action: func,
	hide: bool,
	label: string,
	shortcut: string,
	type: string
})

buttonPropType.submenu = arrayOf(buttonPropType)

MediaOptionButtons.propTypes = {
	buttons: arrayOf(buttonPropType).isRequired,
	navigateWithKeys: func,
	parentMenu: parentMenuPropType
}

MediaOptionsDropdown.propTypes = {
  buttons: arrayOf(buttonPropType).isRequired,
  label: string,
  icon: string,
  parentMenu: parentMenuPropType,
  submenu: bool
}

export default MediaOptionsDropdown
