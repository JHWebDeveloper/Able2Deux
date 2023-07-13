import React from 'react'
import { func } from 'prop-types'

import { selectAllMedia } from 'actions'

const MediaSelectorOptions = ({ dispatch }) => {
  return (
    <div>
      <button
        type="button"
        name="selectAll"
        className="app-button"
        onClick={() => dispatch(selectAllMedia())}>Select All</button>
    </div>
  )
}

MediaSelectorOptions.propTypes = {
  dispatch: func.isRequired
}

export default MediaSelectorOptions
