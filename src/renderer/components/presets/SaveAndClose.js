import React, { useCallback } from 'react'

import { cleanupPresetsAndSave, closePresets } from 'actions'
import { useSaveWarning } from 'hooks'

import ButtonWithIcon from '../form_elements/ButtonWithIcon'

const { interop } = window.ABLE2

const SaveAndClose = ({ dispatch }) => {
  const savePresets = useCallback(closeOnSave => {
		dispatch(cleanupPresetsAndSave(closeOnSave))
	}, [])

  const closeWithoutSaveWarning = useSaveWarning({
		detail: 'If you close presets without saving, any changes you\'ve made will revert to their previously saved state. Proceed?',
		onConfirm() {
			interop.closePresets()
		},
		onSave() {
			savePresets()
		}
	})

  const checkUnsavedAndClosePresets = useCallback(() => {
    dispatch(closePresets(closeWithoutSaveWarning))
  }, [])

  return (
    <>
      <ButtonWithIcon
        label="Save & Close"
        icon="save"
        onClick={() => savePresets(true)} />
      <ButtonWithIcon
        label="Save"
        icon="save"
        onClick={() => savePresets()} />
      <ButtonWithIcon
        label="Close"
        icon="close"
        onClick={checkUnsavedAndClosePresets} />
    </>
  )
}

export default SaveAndClose
