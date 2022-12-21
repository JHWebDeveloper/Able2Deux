import React, { cloneElement, useCallback, useState } from 'react'
import { arrayOf, element, string } from 'prop-types'

import { detectTabExit } from 'utilities'

const DropdownMenu = ({ icon = 'more_vert', children }) => {
	const [ revealMenu, toggleRevealMenu ] = useState(false)
	const [ position, setPosition ] = useState({ top: 0, left: 0 })

	const getPositionRelativeToWindow = useCallback(e => {
		const { bottom, left } = e.target.getBoundingClientRect()

		setPosition({
			top: `${bottom + 3}px`,
			left: `${left}px`
		})
	}, [])

	const closeMenuOnBlur = useCallback(detectTabExit(toggleRevealMenu), [])

	return (
		<span className="dropdown" onBlur={closeMenuOnBlur}>
			<button
				type="button"
				title="Options"
				className="symbol"
				onClick={e => {
					getPositionRelativeToWindow(e)
					toggleRevealMenu(!revealMenu)
				}}
				aria-haspopup="true"
				aria-expanded={revealMenu}>{icon}</button>
			{revealMenu ? (
				<span style={position}>
					{cloneElement(children, { toggleRevealMenu })}
				</span>
			) : <></>}
		</span>
	)
}

DropdownMenu.propTypes = {
	icon: string,
	children: arrayOf(element)
}

export default DropdownMenu
