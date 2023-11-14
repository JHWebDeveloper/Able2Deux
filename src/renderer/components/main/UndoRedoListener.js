import React, { useCallback, useEffect } from 'react'

import { redo, undo } from 'actions'
import { useHistoryResetOnRouteChange } from 'hooks'

const { interop } = window.ABLE2

const UndoRedoListener = ({ clearOnRouteChange, dispatch }) => {
  const dispatchUndo = useCallback(() => {
    dispatch(undo())
  }, [])

  const dispatchRedo = useCallback(() => {
    dispatch(redo())
  }, [])

  if (clearOnRouteChange) {
    useHistoryResetOnRouteChange(dispatch)
  }
  
  useEffect(() => {
    interop.setUndoRedoListeners({
      undo: dispatchUndo,
      redo: dispatchRedo
    })

    return interop.removeUndoRedoListeners
  }, [])

  return <></>
}

export default UndoRedoListener
