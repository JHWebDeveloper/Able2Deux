import React, { useCallback, useContext, useMemo } from 'react'
import { bool, func } from 'prop-types'

import { PrefsContext } from 'store'

import {
  disableWarningAndSave,
  deselectAllMedia,
  selectAllMedia,
  removeAllMedia
} from 'actions'

import { warn } from 'utilities'

import DropdownMenu from '../../form_elements/DropdownMenu.js'
import MediaOptionButtons from '../../form_elements/MediaOptionButtons'

const MediaSelectorOptions = ({ media, allItemsSelected, multipleItemsSelected, dispatch }) => {
  const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
  const { warnings } = preferences

  const dispatchSelectAllMedia = useCallback(() => {
    dispatch(selectAllMedia())
  }, [])

  const dispatchDeselectAllMedia = useCallback(() => {
    dispatch(deselectAllMedia())
  }, [])

  const removeMediaWarning = useCallback(({ message, media }) => warn({
		message,
		detail: 'This cannot be undone. Proceed?',
		enabled: warnings.removeAll,
		callback() {
			dispatch(removeAllMedia(media, false))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('removeAll'))
		}
	}), [media, warnings.removeAll])

  const settingsMenu = useMemo(() => [
    ...allItemsSelected ? [] : [{
      label: 'Select All',
      action: dispatchSelectAllMedia
    }],
    ...multipleItemsSelected ? [{
      label: 'Deselect All',
      action: dispatchDeselectAllMedia
    }] : [],
    { type: 'spacer' },
    ...allItemsSelected ? [] : [{
      label: 'Remove Selected',
      action() {
        dispatch(removeMediaWarning({
          message: 'Remove Selected Media?',
          media: media.filter(item => item.selected)
        }))
      }
    }],
    {
      label: 'Remove All',
      action() {
        dispatch(removeMediaWarning({
          message: 'Remove All Media?',
          media
        }))
      }
    }
  ], [media, allItemsSelected, multipleItemsSelected])

  return (
    <div>
      <DropdownMenu>
        <MediaOptionButtons buttons={settingsMenu} />
      </DropdownMenu>
      {allItemsSelected ? (
        <button
          type="button"
          name="deselectAll"
          className="app-button"
          onClick={dispatchDeselectAllMedia}>Deselect All</button>
      ) : (
        <button
          type="button"
          name="selectAll"
          className="app-button"
          onClick={dispatchSelectAllMedia}>Select All</button>
      )}
    </div>
  )
}

MediaSelectorOptions.propTypes = {
  multipleItemsSelected: bool.isRequired,
	allItemsSelected: bool.isRequired,
  dispatch: func.isRequired
}

export default MediaSelectorOptions
