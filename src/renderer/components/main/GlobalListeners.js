import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { shape, string } from 'prop-types'

import { MainContext } from 'store'
import { removeAllMedia, upload } from 'actions'
import { debounce, pipeAsync } from 'utilities'

const { interop } = window.ABLE2

const saveWindowSize = debounce(() => {
	interop.saveWindowSize(window.outerWidth, window.outerHeight)
}, 500)

const GlobalListeners = ({ scratchDisk }) => {
	const { dispatch } = useContext(MainContext)
	const navigate = useNavigate()

	useEffect(() => {
		interop.addOpenImportCacheListener(scratchDisk.imports)

		return interop.removeOpenImportCacheListener
	}, [scratchDisk])

	useEffect(() => {
		interop.setOpenWithListener(({ block, files }) => {
			if (block) return false

			navigate('/')

			const _pipe = pipeAsync(upload, dispatch)

			for (const file of files) _pipe(file)
		})

		return interop.removeOpenWithListener
	}, [])

	useEffect(() => {
		interop.setStartOverListener(() => {
			dispatch(removeAllMedia())
		})

		return interop.removeStartOverListener
	}, [])

	useEffect(() => {
		window.addEventListener('resize', saveWindowSize)

		return () => {
			window.removeEventListener('resize', saveWindowSize)
		}
	}, [])

	return <></>
}

GlobalListeners.propTypes = {
	scratchDisk: shape({
		imports: string.isRequired
	}).isRequired
}

export default GlobalListeners
