import React, { useCallback, useState } from 'react'
import { v1 as uuid } from 'uuid'
import { arrayOf, bool, func, shape, string } from 'prop-types'

const DropdownMenu = ({ buttons }) => {
	const [ revealMenu, toggleRevealMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })

	const getPositionRelativeToWindow = useCallback(e => {
		const { bottom, left } = e.target.getBoundingClientRect()

		setPosition({
			top: `${bottom + 3}px`,
			left: `${left}px`
		})
	}, [])

	const closeMenuOnBlur = useCallback(e => {
		const parent = e.currentTarget.parentElement
		const trgt = e.relatedTarget

		if (!parent.contains(trgt) || !parent.parentElement.contains(trgt)) {
			toggleRevealMenu(false)
		}
	}, [])

	return (
		<span className="dropdown">
			<button
				type="button"
				title="Options"
				className="symbol"
				onClick={e => {
					getPositionRelativeToWindow(e)
					toggleRevealMenu(!revealMenu)
				}}
				onBlur={closeMenuOnBlur}
				aria-haspopup="true"
				aria-expanded={revealMenu}>more_vert</button>
			{revealMenu && (
				<span style={position}>
					{buttons.map(({ hide, role, label, action }, i) => !hide && (role === 'spacer' ? (
						<span
							key={uuid()}
							className="spacer"
							aria-hidden="true"
							data-no-drag></span>
					) : (
						<button
							key={uuid()}
							type="button"
							autoFocus={i === 0}
							onBlur={closeMenuOnBlur}
							onClick={() => {
								action()
								toggleRevealMenu(false)
							}}
							data-no-drag>{label}</button>
					)))}
				</span>
			)}
		</span>
	)
}

DropdownMenu.propTypes = {
	buttons: arrayOf(shape({
		hide: bool,
		role: string,
		label: string,
		action: func
	}))
}

export default DropdownMenu
