import React, { useId } from 'react'
import { arrayOf, bool, func, object, oneOfType, shape, string } from 'prop-types'

import DropdownMenu from './DropdownMenu'

const MediaOptionButtons = ({ buttons, navigateWithKeys, parentMenu }) => {
	const menuId = useId()

	return (buttons instanceof Function ? buttons() : buttons).map((props, i) => {
		const { hide, type, label, action, shortcut, submenu } = props

		if (hide) return <></>

		const key = `${menuId}_${i}`

		switch (type) {
			case 'spacer':
				return (
					<span
						key={key}
						className="spacer"
						aria-hidden
						data-no-drag>
						{label ? <span>{label}</span> : <></>}
					</span>
				)
			case 'submenu':
				return (
					<MediaOptionsDropdown
						key={key}
						buttons={submenu}
						alignment="right top"
						label={label}
						parentMenu={parentMenu}
						autoFocus={i === 0}
						submenu />
				)
			case 'button':
				return (
					<button
						key={key}
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
			default:
				return <></>
		}

		if (type === 'spacer') {
			acc.push(
				<span
					key={key}
					className="spacer"
					aria-hidden
					data-no-drag>
					{label ? <span>{label}</span> : <></>}
				</span>
			)
		} else if ('submenu' in props) {
			acc.push(
				<MediaOptionsDropdown
					key={key}
					buttons={submenu}
					alignment="right top"
					label={label}
					parentMenu={parentMenu}
					autoFocus={i === 0}
					submenu />
			)
		} else {
			acc.push(
				<button
					key={key}
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

		return acc
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

buttonPropType.submenu = oneOfType([func, arrayOf(buttonPropType)])

MediaOptionButtons.propTypes = {
	buttons: oneOfType([func, arrayOf(buttonPropType)]).isRequired,
	navigateWithKeys: func,
	parentMenu: parentMenuPropType
}

MediaOptionsDropdown.propTypes = {
	buttons: oneOfType([func, arrayOf(buttonPropType)]).isRequired,
	alignment: string,
	label: string,
	icon: string,
	parentMenu: parentMenuPropType,
	autoFocus: bool,
	submenu: bool
}

export default MediaOptionsDropdown
