import React from 'react'
import { func, string } from 'prop-types'

const FilenameOptions = ({ presetNamePrepend, presetNameAppend, updateStateFromEvent }) => {
  return (
    <>
      <fieldset>
        <legend>Prepend to Filename<span aria-hidden>:</span></legend>
        <input
          type="text"
          className="panel-input"
          name="presetNamePrepend"
          placeholder="If none, leave blank"
          maxLength={251}
          value={presetNamePrepend}
          onChange={updateStateFromEvent} />
      </fieldset>
      <fieldset>
        <legend>Append to Filename<span aria-hidden>:</span></legend>
        <input
          type="text"
          className="panel-input"
          name="presetNameAppend"
          placeholder="If none, leave blank"
          maxLength={251}
          value={presetNameAppend}
          onChange={updateStateFromEvent} />
      </fieldset>
    </>
  )
}

FilenameOptions.propTypes = {
  presetNamePrepend: string,
  presetNameAppend: string,
  updateStateFromEvent: func.isRequired
}

export default FilenameOptions