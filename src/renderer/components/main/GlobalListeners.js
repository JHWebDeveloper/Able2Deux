import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toastr from 'toastr'

import { MainContext } from 'store'
import { upload } from 'actions'
import { debounce, toastrOpts } from 'utilities'

const { interop } = window.ABLE2

const saveWindowSize = debounce(() => {
	interop.saveWindowSize(window.outerWidth, window.outerHeight)
}, 500)

const GlobalListeners = ({ imports }) => {
	const { rendering, dispatch } = useContext(MainContext)
	const navigate = useNavigate()

	useEffect(() => {
		interop.addOpenImportCacheListener(imports)

		return interop.removeOpenImportCacheListener
	}, [imports])

	useEffect(() => {
		interop.setOpenWithListener(files => {
			if (rendering) return toastr.error('Files cannot be opened while Able2 is rendering.', false, toastrOpts)

			navigate('/')

			for (const file of files) dispatch(upload(file))
		})

		return interop.removeOpenWithListener
	}, [rendering])

	useEffect(() => {
		window.addEventListener('resize', saveWindowSize)

		return () => {
			window.removeEventListener('resize', saveWindowSize)
		}
	}, [])

	return <></>
}

export default GlobalListeners
