import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toastr from 'toastr'

import { MainContext, PrefsContext } from 'store'
import { upload } from 'actions'
import { TOASTR_OPTIONS } from 'constants'
import { debounce, pipeAsync } from 'utilities'

const { interop } = window.ABLE2

const saveWindowSize = debounce(() => {
	interop.saveWindowSize(window.outerWidth, window.outerHeight)
}, 500)

const GlobalListeners = () => {
	const { rendering, dispatch } = useContext(MainContext)
	const { scratchDisk } = useContext(PrefsContext).preferences
	const navigate = useNavigate()

	useEffect(() => {
		interop.addOpenImportCacheListener(scratchDisk.imports)

		return interop.removeOpenImportCacheListener
	}, [scratchDisk])

	useEffect(() => {
		interop.setOpenWithListener(files => {
			if (rendering) return toastr.error('Files cannot be opened while Able2 is rendering.', false, TOASTR_OPTIONS)

			navigate('/')

			const _pipe = pipeAsync(upload, dispatch)

			for (const file of files) _pipe(file)
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
